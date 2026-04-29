#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# TaskFlow — Debian Server Deployment Script
# Run as root or with sudo: sudo bash deploy.sh
# ═══════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TaskFlow — Debian Server Deployment              ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# --- Step 1: System Updates ---
echo -e "${YELLOW}[1/7] Actualizare sistem...${NC}"
apt-get update -y
apt-get upgrade -y

# --- Step 2: Install Docker if not present ---
echo -e "${YELLOW}[2/7] Verificare Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}  → Instalare Docker Engine...${NC}"
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

# --- Step 3: Install Git if not present ---
echo -e "${YELLOW}[3/7] Verificare Git...${NC}"
if ! command -v git &> /dev/null; then
    apt-get install -y git
    echo -e "${GREEN}  ✓ Git instalat${NC}"
else
    echo -e "${GREEN}  ✓ Git deja instalat: $(git --version)${NC}"
fi

# --- Step 4: Clone or pull repository ---
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

# --- Step 5: Configure environment ---
echo -e "${YELLOW}[5/7] Configurare mediu...${NC}"
ENV_FILE="$APP_DIR/.env"
BACKEND_ENV="$APP_DIR/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}  → Creare fișier .env...${NC}"
    cat > "$ENV_FILE" <<'ENVEOF'
# === TaskFlow Production Environment ===
DATABASE_URL=postgresql://scraper:Scraper123%23@38.242.226.83:5432/MPI
JWT_SECRET=taskflow-mpi-2026-super-secret-key
VITE_API_URL=/api
ENVEOF
    echo -e "${GREEN}  ✓ Fișier .env creat${NC}"
else
    echo -e "${GREEN}  ✓ Fișier .env existent — păstrat${NC}"
fi

if [ ! -f "$BACKEND_ENV" ]; then
    cp "$ENV_FILE" "$BACKEND_ENV"
    echo "PORT=5000" >> "$BACKEND_ENV"
    echo "NODE_ENV=production" >> "$BACKEND_ENV"
    echo -e "${GREEN}  ✓ Backend .env creat${NC}"
fi

# --- Step 6: Build and start containers ---
echo -e "${YELLOW}[6/7] Build și pornire containere Docker...${NC}"
cd "$APP_DIR"
docker compose down 2>/dev/null || true
docker compose up -d --build

echo -e "${YELLOW}  → Așteptare pornire backend (healthcheck)...${NC}"
sleep 10

# Check if containers are running
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

# --- Step 7: Setup firewall ---
echo -e "${YELLOW}[7/7] Configurare firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 3000/tcp comment "TaskFlow Frontend"
    ufw allow 5000/tcp comment "TaskFlow API"
    echo -e "${GREEN}  ✓ Porturi 3000, 5000 deschise${NC}"
else
    echo -e "${YELLOW}  → UFW nu este instalat, poți instala cu: apt install ufw${NC}"
    echo -e "${YELLOW}  → Asigură-te că porturile 3000 și 5000 sunt deschise${NC}"
fi

# --- Done ---
SERVER_IP=$(hostname -I | awk '{print $1}')
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ TaskFlow deploy COMPLET!                      ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 Frontend:  ${BLUE}http://${SERVER_IP}:3000${NC}"
echo -e "  🔧 API:       ${BLUE}http://${SERVER_IP}:5000/api/health${NC}"
echo ""
echo -e "  📋 Comenzi utile:"
echo -e "    ${YELLOW}docker compose logs -f${NC}        — vezi logurile"
echo -e "    ${YELLOW}docker compose restart${NC}        — restart servicii"
echo -e "    ${YELLOW}docker compose down${NC}           — oprire servicii"
echo -e "    ${YELLOW}docker compose up -d --build${NC}  — rebuild + restart"
echo ""
echo -e "  🔑 Conturi test (din seed data):"
echo -e "    andrei@taskflow.dev   / parola123"
echo -e "    maria@taskflow.dev    / parola123"
echo -e "    cristian@taskflow.dev / parola123"
echo ""
