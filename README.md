# 📋 TaskFlow — Aplicație Colaborativă de Gestionare a Task-urilor

> **Proiect MPI** · Express.js · React · PostgreSQL  
> Dashboard Kanban + Calendar integrat cu deadline tracking

## 🚀 Pornire Rapidă

### Cerințe
- Node.js 20+
- npm 10+
- Docker (opțional, pentru deploy pe server)

### 1. Clonează repo-ul
```bash
git clone https://github.com/AndreiLungu64/collaborative-to-do-list.git
cd collaborative-to-do-list
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env     # Gata de folosit — nu trebuie modificat nimic
npm install
npm run migrate          # Creează tabelele în baza de date
npm run seed             # Populează cu date de test (opțional)
npm run dev              # Pornește serverul pe port 5000
```

### 3. Setup Frontend
```bash
cd frontend
cp .env.example .env     # Gata de folosit — nu trebuie modificat nimic
npm install
npm run dev              # Pornește pe port 5173
```

### 4. Docker — Deploy pe Server (o singură comandă)
```bash
cp .env.example .env     # Credențiale deja completate
docker compose up -d --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

### 5. Deploy pe Server Debian (script automat)
```bash
sudo bash deploy.sh
# Instalează Docker, clonează repo-ul, pornește tot automat
```

## 🔑 Conturi de Test
| Utilizator | Email | Parola |
|-----------|-------|--------|
| andrei | andrei@taskflow.dev | parola123 |
| maria | maria@taskflow.dev | parola123 |
| cristian | cristian@taskflow.dev | parola123 |

## 📐 Structura Proiectului

```
├── backend/              # API REST Express.js (TypeScript)
│   ├── src/
│   │   ├── config/       # Configurare DB + variabile mediu
│   │   ├── controllers/  # Handlere HTTP
│   │   ├── middleware/    # Auth JWT, admin check, error handler
│   │   ├── models/       # Acces date (SQL raw)
│   │   ├── routes/       # Definirea rutelor
│   │   ├── services/     # Logică de business
│   │   ├── types/        # Interfețe TypeScript
│   │   ├── utils/        # Logger Winston, cron deadline
│   │   └── app.ts        # Punct de intrare
│   ├── migrations/       # Schema bază de date
│   └── seeds/            # Date de test
├── frontend/             # React + Vite (TypeScript)
│   └── src/
│       ├── components/   # Componente reutilizabile
│       │   ├── auth/     # LoginForm, RegisterForm
│       │   ├── calendar/ # CalendarView, CalendarEvent
│       │   ├── common/   # Button, Modal, Loader, Navbar
│       │   ├── kanban/   # KanbanBoard, KanbanColumn, TaskCard
│       │   └── tasks/    # TaskForm, TaskDetail
│       ├── pages/        # Pagini (Dashboard, Calendar, Login, etc.)
│       ├── context/      # AuthContext (state management)
│       ├── hooks/        # Custom hooks (useTasks, useAuth)
│       ├── services/     # API layer (Axios)
│       ├── types/        # Interfețe TypeScript
│       └── utils/        # Utilitare date
├── deploy.sh             # Script deploy automat Debian
├── docker-compose.yml    # Orchestrare Docker
└── GHID_PREZENTARE_ECHIPA.md  # Ghid prezentare Sprint Review
```

## 🔗 Endpoint-uri API

| Metodă   | Endpoint                        | Descriere           | Acces           |
|----------|---------------------------------|---------------------|-----------------|
| `POST`   | `/api/auth/register`           | Înregistrare        | Public          |
| `POST`   | `/api/auth/login`              | Autentificare JWT   | Public          |
| `GET`    | `/api/auth/me`                 | Profil utilizator   | Autentificat    |
| `GET`    | `/api/tasks`                   | Lista task-uri      | Autentificat    |
| `POST`   | `/api/tasks`                   | Creare task         | Autentificat    |
| `GET`    | `/api/tasks/:id`               | Detalii task        | Autentificat    |
| `PUT`    | `/api/tasks/:id`               | Editare task        | Admin task      |
| `DELETE` | `/api/tasks/:id`               | Ștergere task       | Admin task      |
| `PATCH`  | `/api/tasks/:id/status`        | Schimbare status    | Autentificat    |
| `POST`   | `/api/tasks/:id/access`        | Acordare acces      | Admin task      |
| `DELETE` | `/api/tasks/:id/access/:userId`| Revocare acces      | Admin task      |
| `GET`    | `/api/tasks/deadline`          | Task-uri deadline   | Autentificat    |
| `GET`    | `/api/tasks/calendar`          | Task-uri calendar   | Autentificat    |
| `GET`    | `/api/users`                   | Lista utilizatori   | Autentificat    |
| `GET`    | `/api/health`                  | Health check        | Public          |

## 🎨 Design System

Folosim **„Indigo Slate"** — un design system dark-mode premium:
- **Background**: `#0b1326` (slate profund)
- **Primary**: `#6366f1` / `#c0c1ff` (indigo)
- **Font**: Inter (Google Fonts)
- **Stil**: Glassmorphism cu backdrop blur
- **Animații**: Framer Motion pe toate tranzițiile

## 👥 Echipa

| Rol | Membru | Responsabilitate |
|-----|--------|-----------------|
| Backend Developer | Andrei Lungu | API REST, DB, Auth, Validare |
| Frontend Developer | Alex Achitei | UI React, Kanban, Calendar |
| QA Engineer | Mario Cotea | Teste E2E, User Stories |
| DevOps / Team Lead | Catalin Carcu | Docker, CI/CD, Deploy |

## 🛠️ Tehnologii

| Layer | Tehnologie |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 8 |
| Backend | Express.ts + Node.js 20 |
| Baza de Date | PostgreSQL 16 (remote) |
| Animații | Framer Motion |
| Drag & Drop | @hello-pangea/dnd |
| Notificări | react-hot-toast |
| Containerizare | Docker + Docker Compose |
| CI/CD | GitHub Actions |
