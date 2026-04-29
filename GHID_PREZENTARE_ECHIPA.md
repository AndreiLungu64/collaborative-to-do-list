# 📋 Ghid de Prezentare — TaskFlow (Proiect MPI)

> **Document destinat echipei** — Fiecare membru găsește mai jos ce trebuie să prezinte la evaluare.
> **Ultima actualizare:** 29 Aprilie 2026

---

## 1. Prezentare Generală a Proiectului

### Ce este TaskFlow?
TaskFlow este o **platformă colaborativă de gestionare a task-urilor** construită ca proiect academic pentru disciplina MPI. Aplicația simulează ciclul complet de viață al unui produs software (ALM) folosind practici **Agile Scrum** și **DevOps**.

### Ce face aplicația?
- **Kanban Board** cu 5 coloane: To Do, In Progress, Deadline Zone, Completed, Overdue
- **Calendar interactiv** cu vizualizare lunară și task-uri color-coded după prioritate
- **Sistem de permisiuni granulare** — creatorul task-ului este admin, controlează cine vede/editează
- **Deadline tracking automat** — cron job la fiecare 5 minute care marchează task-urile expirate
- **Drag & Drop** — mutarea task-urilor între coloane prin simpla tragere
- **Autentificare JWT** — login/register cu token-uri securizate

### Stack Tehnologic
| Layer | Tehnologie |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite 8 |
| **Backend** | Express.ts (TypeScript) + Node.js |
| **Baza de Date** | PostgreSQL (remote, partajată) |
| **Styling** | CSS custom cu design system "Indigo Slate" (dark mode, glassmorphism) |
| **Animații** | Framer Motion |
| **Drag & Drop** | @hello-pangea/dnd |
| **Containerizare** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

### Arhitectura pe Scurt
```
┌────────────────┐       ┌──────────────────┐       ┌─────────────────────┐
│  React Frontend│◄─────►│  Express Backend  │◄─────►│  PostgreSQL (Remote)│
│  (port 5173)   │ REST  │  (port 5000)      │  SQL  │  38.242.226.83:5432 │
│                │  API  │                   │       │                     │
│ • Kanban Board │       │ • Auth (JWT)      │       │ • users             │
│ • Calendar     │       │ • CRUD Tasks      │       │ • tasks             │
│ • Task Forms   │       │ • Permisiuni      │       │ • task_access       │
│ • Auth Pages   │       │ • Deadline Cron   │       │                     │
└────────────────┘       └──────────────────┘       └─────────────────────┘
         │                        │
         └──── Docker Compose ────┘
                    │
           GitHub Actions CI/CD
```

### Schema Bazei de Date
```sql
-- 3 tabele principale:
users        (id, username, email, password, created_at)
tasks        (id, title, description, status, visibility, priority, deadline, admin_id, created_at, updated_at)
task_access  (id, task_id, user_id)  -- many-to-many pentru permisiuni
```

---

## 2. Sprinturile și Task-urile (ClickUp)

> **Când prezinți la ClickUp**, vorbești despre task-urile tale din sprint-urile de mai jos. Spune ce ai luat din backlog, cât a durat, și cum ai marcat "Done".

### Sprint 0 — Setup (1 săptămână)
| Task | Responsabil | Status |
|------|-------------|--------|
| Init repo GitHub + branch protection | DevOps / Team Lead | ✅ Done |
| Scaffolding backend Express + frontend React | Backend + Frontend | ✅ Done |
| Schema DB + migrări (users, tasks, task_access) | Backend | ✅ Done |
| Docker Compose (backend + frontend) | DevOps | ✅ Done |
| `.env.example` + configurare conexiune DB remotă | Backend | ✅ Done |

### Sprint 1 — Auth + CRUD (2 săptămâni)
| Task | Responsabil | Status |
|------|-------------|--------|
| Endpoint-uri login/register cu JWT + bcrypt | Backend | ✅ Done |
| AuthContext + localStorage persistence | Frontend | ✅ Done |
| CRUD complet tasks (create, read, update, delete) | Backend | ✅ Done |
| Pagini Login + Register cu validare | Frontend | ✅ Done |
| Middleware auth.ts (verificare JWT) | Backend | ✅ Done |
| Middleware isTaskAdmin.ts | Backend | ✅ Done |
| API layer (Axios instance + interceptors) | Frontend | ✅ Done |

### Sprint 2 — Kanban + Calendar + Permisiuni (2 săptămâni)
| Task | Responsabil | Status |
|------|-------------|--------|
| Kanban Board cu 5 coloane | Frontend | ✅ Done |
| Drag & Drop cu @hello-pangea/dnd | Frontend | ✅ Done |
| Calendar interactiv cu navigare lună/săptămână | Frontend | ✅ Done |
| Endpoint-uri access control (grant/revoke) | Backend | ✅ Done |
| Endpoint calendar cu filtrare start/end | Backend | ✅ Done |
| Task detail modal cu toate informațiile | Frontend | ✅ Done |
| Sistem de filtrare + căutare pe dashboard | Frontend | ✅ Done |

### Sprint 3 — Deadline Zone + Polish + TypeScript Migration (1 săptămână)
| Task | Responsabil | Status |
|------|-------------|--------|
| Cron job deadline checker (la 5 min) | Backend | ✅ Done |
| Deadline Zone (coloană vizuală < 1h) | Frontend | ✅ Done |
| Overdue marking automat | Backend | ✅ Done |
| Validare deadline (nu se pot crea task-uri în trecut) | Backend | ✅ Done |
| Migrare completă JS → TypeScript (56 fișiere) | Backend + Frontend | ✅ Done |
| Seed data (3 useri, 15 task-uri, 8 permisiuni) | Backend | ✅ Done |
| Design system "Indigo Slate" + glassmorphism | Frontend | ✅ Done |

---

## 3. Prezentarea pe Roluri

---

### 🔧 3.1 Backend Developer — Ce să Prezinți

#### Introducere (30 secunde)
> „Eu am fost responsabil de **API-ul REST** și toată **logica de server**. Am construit backend-ul cu **Express.js în TypeScript**, conectat la o bază de date **PostgreSQL remotă**. Arhitectura urmează pattern-ul **Controller → Service → Model** pentru separarea responsabilităților."

#### Ce ai construit — punct cu punct:

**1. Autentificare (JWT + bcrypt)**
> „Am implementat sistemul de autentificare complet:
> - **Register** — creează utilizator cu parolă hashată cu bcrypt (10 salt rounds)
> - **Login** — verifică credențialele și returnează un JWT token
> - **Middleware auth.ts** — interceptează fiecare request, extrage token-ul din header-ul `Authorization: Bearer ...`, îl verifică cu `jsonwebtoken`, și atașează datele user-ului pe `req.user`
> - Token-ul conține: `id`, `username`, `email`"

**2. CRUD Tasks complet**
> „Endpoint-urile pentru task-uri:
> - `POST /api/tasks` — creare cu validare prin `express-validator` (titlu obligatoriu, max 100 caractere, deadline obligatoriu în format ISO 8601, vizibilitate și prioritate opționale cu valori predefinite)
> - `GET /api/tasks` — listare task-uri vizibile pentru user (query SQL cu `DISTINCT` + `LEFT JOIN` pe 3 tabele)
> - `PUT /api/tasks/:id` — editare (doar admin-ul task-ului, verificat prin middleware `isTaskAdmin`)
> - `DELETE /api/tasks/:id` — ștergere (doar admin)
> - `PATCH /api/tasks/:id/status` — schimbare status (todo/in_progress/completed/overdue)"

**3. Sistem de permisiuni granulare**
> „Un task are 3 nivele de acces:
> - **Admin** (creatorul) — poate edita, șterge, acorda/revoca acces
> - **Public** — orice utilizator autentificat poate vedea task-ul
> - **Access list** — tabel `task_access` many-to-many, admin-ul controlează cine are acces
>
> Endpoint-uri dedicate: `POST /api/tasks/:id/access` și `DELETE /api/tasks/:id/access/:userId`"

**4. Deadline management automat**
> „Am implementat un **cron job** cu `node-cron` care rulează la fiecare 5 minute:
> - Verifică task-urile cu deadline-ul trecut
> - Le marchează automat ca `overdue` în baza de date
> - Loghează activitatea cu Winston
>
> Am adăugat și **validare la creare/editare** — nu se pot seta deadline-uri în trecut."

**5. Calendar API**
> „Endpoint `GET /api/tasks/calendar?start=...&end=...` care returnează task-urile dintr-un interval de date, filtrate după permisiunile user-ului."

**6. Seed data**
> „Am creat seed-uri cu date de test: 3 utilizatori (andrei, maria, cristian), 15 task-uri distribuite pe toate statusurile și prioritățile, și 8 intrări de access control. Deadline-urile sunt relative la momentul rulării."

#### La ClickUp — ce task-uri ai avut:
> „În ClickUp am avut task-urile de **Sprint 0** (init Express, schema DB, migrări), **Sprint 1** (auth endpoints, CRUD, middleware-uri), și **Sprint 3** (cron job, validare deadline, seed data, migrare TypeScript pe backend)."

#### Fișiere cheie de arătat:
- `backend/src/app.ts` — entry point, configurare middleware + rute
- `backend/src/routes/tasks.routes.ts` — definirea rutelor cu validare
- `backend/src/services/task.service.ts` — logica de business
- `backend/src/models/task.model.ts` — query-urile SQL
- `backend/src/middleware/auth.ts` — verificare JWT
- `backend/src/utils/deadlineCron.ts` — cron job automat
- `backend/src/types/index.ts` — toate interfețele TypeScript

---

### 🎨 3.2 Frontend Developer — Ce să Prezinți

#### Introducere (30 secunde)
> „Eu am fost responsabil de **interfața utilizatorului**. Am construit frontend-ul cu **React 19 + TypeScript** folosind **Vite** ca bundler. Design-ul urmează un sistem propriu numit **Indigo Slate** — dark mode premium cu glassmorphism, animații Framer Motion, și drag & drop."

#### Ce ai construit — punct cu punct:

**1. Kanban Board (Dashboard)**
> „Pagina principală este un **Kanban Board cu 5 coloane**:
> - **To Do**, **In Progress**, **Deadline Zone** (< 1 oră), **Completed**, **Overdue**
> - Task-urile sunt categorizate automat — un task `todo` cu deadline-ul în mai puțin de 1 oră apare automat în Deadline Zone
> - **Drag & Drop** implementat cu `@hello-pangea/dnd` — poți trage un task dintr-o coloană în alta, și statusul se actualizează automat prin API
> - Fiecare coloană afișează un counter cu numărul de task-uri
> - Am adăugat și **filtrare** (după prioritate) + **căutare** (după titlu)"

**2. Task Card (componenta principală)**
> „Fiecare card afișează:
> - **Priority badge** color-coded (verde=low, galben=medium, portocaliu=high, roșu=critical)
> - **Deadline relativ** (ex: 'în 2 ore', 'acum 3 zile') cu culori de avertizare
> - **Avatare** pentru utilizatorii cu acces (stack de inițiale)
> - **Stripe lateral** colorat după prioritate
> - Animații la hover (se ridică ușor) și la apariție/dispariție (fade + slide)"

**3. Calendar Interactiv**
> „Am construit un calendar lunar custom, fără librării externe:
> - Grid de 7×6 cu zilele lunii
> - Navigare între luni (butoane prev/next + buton 'Azi')
> - Task-urile apar ca **pills color-coded** pe ziua deadline-ului
> - Maximum 3 task-uri vizibile per zi, cu indicator '+N mai multe'
> - Zilele din alte luni sunt dimmed, ziua curentă are un inel albastru"

**4. Sistem de Autentificare (UI)**
> „Am implementat:
> - **AuthContext** cu React Context API — token-ul JWT e persistat în `localStorage`
> - **ProtectedRoute** — componentă wrapper care redirecționează la `/login` dacă nu ești autentificat
> - **Axios interceptor** — adaugă automat header-ul `Authorization: Bearer ...` la fiecare request
> - Pagini **Login** și **Register** cu validare și feedback vizual (toast notifications)"

**5. Design System — Indigo Slate**
> „Am creat un design system custom:
> - **Culori**: Background `#0b1326`, Primary `#6366f1` / `#c0c1ff`, Surface-uri semi-transparente
> - **Glassmorphism**: `backdrop-filter: blur(16px)` pe carduri și modale
> - **Font**: Inter (Google Fonts)
> - **Animații**: Framer Motion pe toate tranzițiile (modale, carduri, pagini)
> - **Toast notifications**: react-hot-toast cu stilizare custom"

**6. Task Form Modal**
> „Modal animat pentru crearea de task-uri noi:
> - Câmpuri: titlu, descriere, deadline (datetime picker), vizibilitate (personal/public), prioritate (dropdown)
> - Validare client-side + erori de la server afișate în toast"

#### La ClickUp — ce task-uri ai avut:
> „În ClickUp am lucrat pe **Sprint 1** (Login/Register pages, AuthContext, Axios setup), **Sprint 2** (Kanban Board, Drag & Drop, Calendar, filtrare/căutare, task detail modal), și **Sprint 3** (design system Indigo Slate, migrare TypeScript pe frontend)."

#### Fișiere cheie de arătat:
- `frontend/src/pages/Dashboard.tsx` — Kanban Board complet
- `frontend/src/pages/Calendar.tsx` — Calendar custom
- `frontend/src/components/kanban/TaskCard.tsx` — componenta card
- `frontend/src/context/AuthContext.tsx` — state management autentificare
- `frontend/src/hooks/useTasks.ts` — hook custom pentru operații CRUD
- `frontend/src/index.css` — design system complet
- `frontend/src/types/index.ts` — interfețele TypeScript

---

### 🧪 3.3 QA Engineer / Tester — Ce să Prezinți

#### Introducere (30 secunde)
> „Eu am fost responsabil de **calitatea produsului**. Am definit **User Stories** cu criterii de acceptare, am scris **teste**, am validat funcționalitățile pe fiecare PR, și am raportat bug-uri."

#### Ce ai făcut — punct cu punct:

**1. User Stories cu Acceptance Criteria**
> „Am definit User Stories pentru fiecare funcționalitate **înainte** de implementare. Exemplu:
> - **US-001: Creare Task** — CA UN utilizator autentificat, VREAU SĂ creez un task cu titlu, descriere, deadline, vizibilitate și prioritate, ASTFEL ÎNCÂT să îmi organizez activitățile.
>   - Criterii: titlu obligatoriu (max 100 char), deadline obligatoriu și nu în trecut, vizibilitate default 'personal', prioritate default 'medium', task-ul apare în 'To Do', creatorul devine admin
> - **US-002: Kanban Drag & Drop** — mutarea task-urilor între coloane
> - **US-003: Deadline Zone** — task-uri cu < 1 oră apar automat în coloana specială
> - **US-004: Permisiuni** — doar admin-ul poate edita/șterge"

**2. Test Plan & Test Cases**
> „Am creat un test plan care acoperă:
> - **Smoke tests** — login funcționează, dashboard se încarcă, API health check
> - **Functional tests** — CRUD complet (creare, vizualizare, editare, ștergere task)
> - **Permission tests** — user fără acces nu poate vedea task personal, admin poate edita, user normal nu
> - **Edge cases** — titlu gol, deadline în trecut, token expirat, status invalid
> - **UI tests** — drag & drop funcționează, calendar afișează task-urile corect"

**3. Validare pe Pull Requests**
> „La fiecare PR am verificat:
> - Codul tratează erorile corect? (try/catch, HTTP status codes)
> - Validarea input-ului este prezentă? (express-validator pe backend)
> - Edge cases sunt acoperite? (string gol, date invalide, acces neautorizat)
> - UI-ul afișează stări de loading/error/empty state?"

**4. Bug Reports**
> „Am raportat bug-uri în format standard:
> - Pași de reproducere, rezultat așteptat vs. actual, severity, screenshot
> - Exemplu: 'Deadline-ul nu validează datele din trecut la editare' → rezolvat în feature/BE-deadline-validation"

**5. Definition of Done (DoD)**
> „Am verificat că fiecare task respectă DoD-ul:
> - Codul funcționează local
> - PR-ul a primit review
> - CI-ul trece (build + lint)
> - Documentația este actualizată"

**6. Seed Data Validation**
> „Am validat seed-urile: 3 useri pot face login cu 'parola123', cele 15 task-uri acoperă toate combinațiile de status/prioritate/vizibilitate, și cele 8 permisiuni de acces sunt corecte."

#### La ClickUp — ce task-uri ai avut:
> „În ClickUp am avut: **Sprint 0** (definire User Stories Sprint 1), **Sprint 1** (test plan auth, validare PR-uri BE/FE), **Sprint 2** (teste Kanban + Calendar + permisiuni), **Sprint 3** (validare deadline, teste seed data, regression pe migrarea TypeScript)."

---

### 🚀 3.4 DevOps / Infrastructure — Ce să Prezinți

#### Introducere (30 secunde)
> „Eu am fost responsabil de **infrastructura** proiectului — Docker, CI/CD, configurare repository, și deployment. Am asigurat că tot proiectul poate fi pornit cu o singură comandă și că fiecare PR este testat automat."

#### Ce ai făcut — punct cu punct:

**1. Docker & Docker Compose**
> „Am containerizat întreaga aplicație:
> - **docker-compose.yml** — orchestrează 2 servicii (backend + frontend)
> - **Backend Dockerfile** — multi-stage build cu `node:20-alpine`
> - **Frontend Dockerfile** — build cu Node, serving cu Nginx
> - Baza de date este **remote** (nu rulează local) — simplifică setup-ul
> - Health check pe backend: `curl -f http://localhost:5000/api/health` la 30s
> - O singură comandă pornește tot: `docker compose up --build`"

**2. GitHub Repository Management**
> „Am configurat repo-ul:
> - **Branch protection pe `main`** — nu se poate face push direct, doar prin PR
> - **Structura de branch-uri**: `main` (producție) ← `develop` (integrare) ← `feature/*` (dezvoltare)
> - **Convenție de denumire**: `feature/BE-*` (backend), `feature/FE-*` (frontend), `feature/QA-*` (teste)
> - Toți membrii sunt **Collaborators** cu acces push"

**3. CI/CD Pipeline (GitHub Actions)**
> „Am configurat pipeline-ul automat:
> - **CI** — pe fiecare Pull Request: instalare dependențe, lint, build (backend + frontend)
> - **CD** — pe merge în main: deploy automat pe cloud
> - Pipeline-ul rulează pe `ubuntu-latest` cu Node.js 20"

**4. Environment Management**
> „Am gestionat variabilele de mediu:
> - **`.env.example`** — template pentru fiecare serviciu (fără credențiale reale)
> - **GitHub Secrets** — credențialele pentru CI/CD (DATABASE_URL, JWT_SECRET)
> - **`.gitignore`** — exclude `.env`, `node_modules`, `dist/` din repository"

**5. Baza de Date Remote**
> „Am configurat o instanță PostgreSQL partajată pe un VPS (38.242.226.83:5432):
> - Baza de date `MPI` folosită de toată echipa
> - Connection string securizat prin `.env`
> - Migrări rulate cu `npm run migrate`"

**6. Developer Experience**
> „Am asigurat un DX bun:
> - `npm run dev` pornește serverul cu hot-reload (`tsx watch` pe backend, Vite pe frontend)
> - `npm run seed` populează baza de date cu date de test
> - Documentație completă în README.md cu pașii de setup"

#### La ClickUp — ce task-uri ai avut:
> „În ClickUp am avut: **Sprint 0** (Docker Compose, Dockerfiles, init repo, branch protection, .env setup), **Sprint 1** (GitHub Actions CI pipeline), **Sprint 2** (health checks, logging config), **Sprint 3** (deploy final, verificare Docker cu TypeScript)."

#### Fișiere cheie de arătat:
- `docker-compose.yml` — orchestrare servicii
- `backend/Dockerfile` — containerizare backend
- `.github/workflows/ci.yml` — pipeline CI
- `.gitignore` — excluderi securitate
- `README.md` — documentație setup

---

## 4. Cum să Faci Demo-ul Live

### Pași de demonstrare (pentru toată echipa):

1. **Pornire aplicație**: `npm run dev` în backend + frontend
2. **Register** — creează un cont nou (arată formularul, validarea, toast-ul de succes)
3. **Login** — autentifică-te (arată JWT-ul în localStorage din DevTools)
4. **Creare Task** — click "Task Nou", completează formularul (arată validarea deadline în trecut)
5. **Kanban Board** — arată cele 5 coloane, drag & drop între ele
6. **Calendar** — navighează între luni, arată pills color-coded
7. **Task Detail** — click pe un card, arată modalul cu toate informațiile
8. **Filtrare** — filtrează după prioritate, caută după titlu
9. **Docker** — arată `docker compose up` (opțional, dacă ai timp)

### Conturi de test (din seed data):
| Username | Email | Parola |
|----------|-------|--------|
| andrei | andrei@taskflow.dev | parola123 |
| maria | maria@taskflow.dev | parola123 |
| cristian | cristian@taskflow.dev | parola123 |

---

## 5. Întrebări Frecvente de la Evaluator

| Întrebare | Răspuns scurt |
|-----------|--------------|
| **De ce TypeScript?** | Type safety, autocompletare, mai puține bug-uri la runtime, standard industrial |
| **De ce PostgreSQL remote?** | Toată echipa lucrează pe aceeași bază de date, nu trebuie setup local |
| **De ce JWT și nu sesiuni?** | Stateless, scalabil, funcționează bine cu REST API |
| **Cum funcționează drag & drop?** | Library @hello-pangea/dnd, la drop se face PATCH pe API cu noul status |
| **Ce face cron job-ul?** | La fiecare 5 minute verifică deadline-uri expirate și le marchează ca overdue |
| **Cum funcționează permisiunile?** | Creatorul = admin, task public = vizibil tuturor, task personal = doar admin + access list |
| **De ce Vite și nu CRA?** | Vite e mult mai rapid (HMR instant), CRA e deprecated |
| **Cum se deployează?** | `docker compose up --build` — o singură comandă, CI/CD pe GitHub Actions |

---

> **Sfat final**: La prezentare, fiecare vorbește **doar despre partea lui**. Nu încercați să explicați tot proiectul — concentrați-vă pe detaliile tehnice ale rolului vostru. Arătați cod, arătați rezultatul în browser, și fiți pregătiți să răspundeți la întrebări despre implementarea voastră specifică.
