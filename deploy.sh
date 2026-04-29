#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TaskFlow — Script de Deploy pentru Debian
# Rulează ca root: sudo bash deploy.sh
# Totul este plug-and-play — nu trebuie configurat nimic manual.
# ═══════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TaskFlow — Deploy Automat pe Server Debian        ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# --- Pas 1: Actualizare sistem ---
echo -e "${YELLOW}[1/7] Actualizare pachete sistem...${NC}"
apt-get update -y
apt-get upgrade -y

# --- Pas 2: Instalare Docker ---
echo -e "${YELLOW}[2/7] Verificare Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}  → Se instalează Docker Engine...${NC}"
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}  ✓ Docker instalat cu succes${NC}"
else
    echo -e "${GREEN}  ✓ Docker deja instalat: $(docker --version)${NC}"
fi

# --- Pas 3: Instalare Git ---
echo -e "${YELLOW}[3/7] Verificare Git...${NC}"
if ! command -v git &> /dev/null; then
    apt-get install -y git
    echo -e "${GREEN}  ✓ Git instalat${NC}"
else
    echo -e "${GREEN}  ✓ Git deja instalat: $(git --version)${NC}"
fi

# --- Pas 4: Clonare sau actualizare cod ---
echo -e "${YELLOW}[4/7] Pregătire cod sursă...${NC}"
APP_DIR="/opt/taskflow"

if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}  → Actualizare repository existent...${NC}"
    cd "$APP_DIR"
    git fetch --all
    git checkout develop
    git pull origin develop
else
    echo -e "${YELLOW}  → Clonare repository...${NC}"
    git clone https://github.com/AndreiLungu64/collaborative-to-do-list.git "$APP_DIR"
    cd "$APP_DIR"
    git checkout develop
fi
echo -e "${GREEN}  ✓ Cod sursă pregătit în $APP_DIR${NC}"

# --- Pas 5: Configurare mediu (plug-and-play) ---
echo -e "${YELLOW}[5/7] Configurare variabile de mediu...${NC}"

# Copiere .env.example → .env (credențiale deja completate)
if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo -e "${GREEN}  ✓ Fișier .env creat din .env.example${NC}"
else
    echo -e "${GREEN}  ✓ Fișier .env existent — păstrat${NC}"
fi

if [ ! -f "$APP_DIR/backend/.env" ]; then
    cp "$APP_DIR/backend/.env.example" "$APP_DIR/backend/.env"
    echo -e "${GREEN}  ✓ Backend .env creat din .env.example${NC}"
else
    echo -e "${GREEN}  ✓ Backend .env existent — păstrat${NC}"
fi

if [ ! -f "$APP_DIR/frontend/.env" ]; then
    cp "$APP_DIR/frontend/.env.example" "$APP_DIR/frontend/.env"
    echo -e "${GREEN}  ✓ Frontend .env creat din .env.example${NC}"
else
    echo -e "${GREEN}  ✓ Frontend .env existent — păstrat${NC}"
fi

# --- Pas 6: Build și pornire containere ---
echo -e "${YELLOW}[6/7] Build și pornire containere Docker...${NC}"
cd "$APP_DIR"
docker compose down 2>/dev/null || true
docker compose up -d --build

echo -e "${YELLOW}  → Se așteaptă pornirea backend-ului (healthcheck)...${NC}"
sleep 15

# Verificare dacă containerele rulează
if docker ps | grep -q taskflow-backend; then
    echo -e "${GREEN}  ✓ Backend pornit cu succes${NC}"
else
    echo -e "${RED}  ✗ Backend nu a pornit! Verifică logurile: docker compose logs backend${NC}"
fi

if docker ps | grep -q taskflow-frontend; then
    echo -e "${GREEN}  ✓ Frontend pornit cu succes${NC}"
else
    echo -e "${RED}  ✗ Frontend nu a pornit! Verifică logurile: docker compose logs frontend${NC}"
fi

# --- Pas 7: Configurare firewall ---
echo -e "${YELLOW}[7/7] Configurare firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 8081/tcp comment "TaskFlow Frontend" 2>/dev/null || true
    ufw allow 5000/tcp comment "TaskFlow API" 2>/dev/null || true
    echo -e "${GREEN}  ✓ Porturile 8081 și 5000 deschise${NC}"
else
    echo -e "${YELLOW}  → UFW nu este instalat — asigură-te că porturile 8081 și 5000 sunt deschise${NC}"
fi

# --- Gata ---
SERVER_IP=$(hostname -I | awk '{print $1}')
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ TaskFlow — Deploy COMPLET!                     ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 Frontend:  ${BLUE}http://${SERVER_IP}:8081${NC}"
echo -e "  🔧 API:       ${BLUE}http://${SERVER_IP}:5000/api/health${NC}"
echo ""
echo -e "  📋 Comenzi utile:"
echo -e "    ${YELLOW}cd /opt/taskflow${NC}"
echo -e "    ${YELLOW}docker compose logs -f${NC}        — loguri în timp real"
echo -e "    ${YELLOW}docker compose restart${NC}        — restart servicii"
echo -e "    ${YELLOW}docker compose down${NC}           — oprire servicii"
echo -e "    ${YELLOW}docker compose up -d --build${NC}  — rebuild complet"
echo ""
echo -e "  🔑 Conturi de test (din seed data):"
echo -e "    andrei@taskflow.dev   / parola123"
echo -e "    maria@taskflow.dev    / parola123"
echo -e "    cristian@taskflow.dev / parola123"
echo ""
