# 📋 TaskFlow — Collaborative To-Do App

> **Proiect MPI** · Express.js · React · PostgreSQL  
> Dashboard Kanban + Calendar integrat cu deadline tracking

## 🚀 Quick Start

### Cerințe
- Node.js 20+
- npm 10+
- Docker (opțional, pentru deploy)

### 1. Clonează repo-ul
```bash
git clone https://github.com/AndreiLungu64/collaborative-to-do-list.git
cd collaborative-to-do-list
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Editează .env cu credențialele bazei de date
npm install
npm run migrate   # Creează tabelele în baza de date
npm run dev       # Pornește serverul pe port 5000
```

### 3. Setup Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # Pornește pe port 5173
```

### 4. Docker (alternativ)
```bash
cp .env.example .env
# Editează .env cu credențialele
docker compose up --build
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

## 📐 Structura Proiectului

```
├── backend/              # Express.js REST API
│   ├── src/
│   │   ├── config/       # DB + env config
│   │   ├── controllers/  # HTTP handlers
│   │   ├── middleware/   # Auth, admin check, error handler
│   │   ├── models/       # Data access (SQL)
│   │   ├── routes/       # Route definitions
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Logger, cron
│   │   └── app.js        # Entry point
│   └── migrations/       # DB schema
├── frontend/             # React + Vite
│   └── src/
│       ├── components/   # Reusable UI
│       ├── pages/        # Route pages
│       ├── context/      # Auth state
│       ├── hooks/        # Custom hooks
│       ├── services/     # API layer
│       └── utils/        # Date helpers
├── docker-compose.yml
└── VISION_DOCUMENT.md
```

## 🔗 API Endpoints

| Metoda   | Endpoint                        | Acces           |
|----------|---------------------------------|-----------------|
| `POST`   | `/api/auth/register`           | Public          |
| `POST`   | `/api/auth/login`              | Public          |
| `GET`    | `/api/auth/me`                 | Autentificat    |
| `GET`    | `/api/tasks`                   | Autentificat    |
| `POST`   | `/api/tasks`                   | Autentificat    |
| `GET`    | `/api/tasks/:id`               | Autentificat    |
| `PUT`    | `/api/tasks/:id`               | Admin task      |
| `DELETE` | `/api/tasks/:id`               | Admin task      |
| `PATCH`  | `/api/tasks/:id/status`        | Autentificat    |
| `POST`   | `/api/tasks/:id/access`        | Admin task      |
| `DELETE` | `/api/tasks/:id/access/:userId`| Admin task      |
| `GET`    | `/api/tasks/deadline`          | Autentificat    |
| `GET`    | `/api/tasks/calendar`          | Autentificat    |

## 🎨 Design System

Folosim **"Indigo Slate"** — un design system dark-mode premium:
- **Background**: `#0b1326` (deep slate)
- **Primary**: `#6366f1` / `#c0c1ff` (indigo)
- **Font**: Inter
- **Style**: Glassmorphism cu backdrop blur

## 👥 Echipa

| Rol | Responsabilitate |
|-----|-----------------|
| Backend Dev | API REST, DB, Auth |
| Frontend Dev | UI React, Kanban, Calendar |
| QA Engineer | Teste E2E, User Stories |
| DevOps | Docker, CI/CD, Deploy |
