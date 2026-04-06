# 📋 Document de Viziune — Collaborative To-Do App

> **Proiect MPI** · Stack: Express.ts · React · PostgreSQL  
> **Scop**: Simularea completă a ciclului de viață al unei aplicații (ALM) folosind practici Agile & DevOps.  
> **GitHub Repository**: [https://github.com/AndreiLungu64/collaborative-to-do-list](https://github.com/AndreiLungu64/collaborative-to-do-list)

---

## 1. Viziunea Produsului

O platformă colaborativă de gestionare a task-urilor, structurată ca un **Kanban Board**, cu **calendar integrat**, sistem de **vizibilitate și permisiuni granulare**, și **deadline tracking** cu notificări vizuale. Aplicația prioritizează un **proces automatizat impecabil** (CI/CD, teste, Docker) în fața complexității de business.

### 1.1 Propunere de Valoare

| Problemă | Soluție |
|---|---|
| Task-urile echipei sunt greu de vizualizat | Dashboard Kanban + Calendar integrat |
| Lipsa controlului asupra vizibilității | Vizibilitate granulară (personal/public) + access list |
| Deadline-urile sunt ratate fără avertizare | Zona de deadline (1h înainte) + marcaj roșu la expirare |
| Task-urile finalizate poluează board-ul | Mutare automată în secțiunea "Completed" |

---

## 2. Funcționalități Cheie

### 2.1 Calendar cu Task-uri
- Calendar interactiv populat cu task-uri existente
- Vizualizare zilnică/săptămânală/lunară
- Color-coding după prioritate și status

### 2.2 Creare & Gestionare Task-uri
Meniu dedicat cu câmpurile:
| Câmp | Tip | Detalii |
|---|---|---|
| Titlu | `string` | Obligatoriu, max 100 caractere |
| Descriere | `text` | Opțional, suportă markdown |
| Deadline | `datetime` | Obligatoriu |
| Vizibilitate | `enum` | `personal` / `public` |
| Prioritate | `enum` | `low` / `medium` / `high` / `critical` |
| Asignați | `user[]` | Lista de utilizatori cu acces |

### 2.3 Dashboard — Kanban Board
Coloane standard:
1. **To Do** — task-uri noi
2. **In Progress** — task-uri în lucru
3. **⚠️ Deadline Zone** — task-uri cu mai puțin de 1 oră până la deadline
4. **Completed** — task-uri finalizate (mutate automat din calendar)
5. **Overdue** — task-uri neîndeplinite după deadline (marcate cu roșu)

### 2.4 Sistem de Permisiuni
- **Creatorul task-ului = Admin** al acelui task
- Adminul controlează cine are acces, chiar și la task-urile publice
- **Doar adminul** poate edita/șterge task-ul
- Persoanele selectate pot **vizualiza** task-ul

### 2.5 Lifecycle Management
```
[Creare] → [Calendar + Kanban "To Do"] → [In Progress]
                                              ↓
                              [1h înainte] → Deadline Zone
                                              ↓
                              [Deadline atins] → Completat? → DA → "Completed" (dispare din calendar)
                                                             → NU → Rămâne în calendar, marcat ROȘU
```

---

## 3. Arhitectura Tehnică

### 3.1 Baza de Date — Conexiune

> [!IMPORTANT]
> Proiectul folosește o instanță PostgreSQL **remote, partajată** de întreaga echipă. Nu este nevoie să rulați PostgreSQL local.

| Parametru | Valoare |
|---|---|
| **Host** | `38.242.226.83` |
| **Port** | `5432` |
| **Database** | `MPI` |
| **User** | `scraper` |
| **Password** | `Scraper123#` |
| **Connection String** | `postgresql://scraper:Scraper123#@38.242.226.83:5432/MPI` |

**Variabilă de mediu (`.env`):**
```env
DATABASE_URL=postgresql://scraper:Scraper123#@38.242.226.83:5432/MPI
```

> [!WARNING]
> Acest connection string **NU** se commitează în repository. Se pune în `.env` (care este în `.gitignore`) și în **GitHub Secrets** pentru CI/CD. Fișierul `.env.example` va conține doar template-ul:
> ```
> DATABASE_URL=postgresql://user:password@host:5432/database
> ```

### 3.2 Diagrama de Ansamblu

```
┌─────────────────────┐       ┌──────────────────────┐       ┌───────────────────────────┐
│   React Frontend    │◄─────►│  Express.ts Backend  │◄─────►│   PostgreSQL DB (Remote)  │
│   (Port 3000)       │ REST  │   (Port 5000)        │       │   38.242.226.83:5432/MPI  │
│                     │  API  │                      │       │                           │
│ - Kanban Board      │       │ - Auth (JWT)         │       │ - users                   │
│ - Calendar          │       │ - CRUD Tasks         │       │ - tasks                   │
│ - Task Forms        │       │ - Permissions        │       │ - task_access              │
│ - Auth Pages        │       │ - Deadline Cron      │       │                           │
└─────────────────────┘       └──────────────────────┘       └───────────────────────────┘
         │                              │
         └──────── Docker Compose ──────┘
                        │
              GitHub Actions CI/CD
                        │
                  Cloud Deploy
              (Render / Railway)
```

### 3.3 Schema Bază de Date

```sql
-- Users Table
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,  -- bcrypt hashed
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE tasks (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    description TEXT,
    status      VARCHAR(20) DEFAULT 'todo',       -- todo, in_progress, completed, overdue
    visibility  VARCHAR(10) DEFAULT 'personal',    -- personal, public
    priority    VARCHAR(10) DEFAULT 'medium',      -- low, medium, high, critical
    deadline    TIMESTAMP NOT NULL,
    admin_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Task Access Control (many-to-many)
CREATE TABLE task_access (
    id          SERIAL PRIMARY KEY,
    task_id     INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(task_id, user_id)
);
```

### 3.4 API Endpoints (REST)

| Metoda | Endpoint | Descriere | Acces |
|---|---|---|---|
| `POST` | `/api/auth/register` | Înregistrare utilizator | Public |
| `POST` | `/api/auth/login` | Autentificare (returnează JWT) | Public |
| `GET` | `/api/tasks` | Lista task-uri vizibile pentru user | Autentificat |
| `POST` | `/api/tasks` | Creare task nou | Autentificat |
| `GET` | `/api/tasks/:id` | Detalii task | Autentificat + Acces |
| `PUT` | `/api/tasks/:id` | Editare task | Admin task |
| `DELETE` | `/api/tasks/:id` | Ștergere task | Admin task |
| `PATCH` | `/api/tasks/:id/status` | Schimbare status | Autentificat + Acces |
| `POST` | `/api/tasks/:id/access` | Adăugare acces utilizator | Admin task |
| `DELETE` | `/api/tasks/:id/access/:userId` | Revocare acces | Admin task |
| `GET` | `/api/tasks/deadline` | Task-uri aproape de deadline | Autentificat |
| `GET` | `/api/tasks/calendar` | Task-uri pentru calendar view | Autentificat |

---

## 4. Constrângeri Obligatorii ("Reguli de Aur")

> [!CAUTION]
> **FĂRĂ PUSH PE `main`!** Fiecare push direct pe `main` = **-1 punct din nota finală**. Totul se face prin Pull Requests legate de Issue-uri.

| Constrângere | Detaliu |
|---|---|
| Arhitectură | Client-Server (REST API) |
| Bază de date | PostgreSQL (relațională, SQL) |
| Docker | Proiectul pornește complet cu `docker compose up` |
| Deploy | Automat în Cloud (Render / Railway) |
| Branching | Branch protection pe `main`, merge doar prin PR |
| Testing | Teste unitare + E2E obligatorii |
| CI/CD | GitHub Actions pe fiecare PR |

---

## 5. Metodologia de Lucru — Agile Scrum

### 5.1 Sprinturi

| Sprint | Durata | Focus |
|---|---|---|
| Sprint 0 | 1 săptămână | Setup: repo, Docker, DB schema, CI/CD de bază |
| Sprint 1 | 2 săptămâni | Auth + CRUD Tasks (Backend + Frontend de bază) |
| Sprint 2 | 2 săptămâni | Kanban Board + Calendar + Permisiuni |
| Sprint 3 | 1 săptămână | Deadline Zone + Polish + Deploy final |

### 5.2 Ceremonii Scrum

| Ceremonie | Frecvență | Durată | Scop |
|---|---|---|---|
| Daily Stand-up | Zilnic (text pe chat) | 5 min | Ce am făcut / Ce fac / Blocaje |
| Sprint Planning | Început de sprint | 30 min | Selectare task-uri din Backlog |
| Sprint Review | Sfârșit de sprint | 30 min | Demo funcționalități noi |
| Sprint Retrospective | Sfârșit de sprint | 15 min | Ce a mers bine / Ce îmbunătățim |

### 5.3 Definition of Done (DoD)

Un task este "Done" **doar** dacă:
- [ ] Codul este scris și funcționează local
- [ ] Există teste (unit și/sau E2E) care acoperă funcționalitatea
- [ ] Codul trece prin CI (build + teste verzi)
- [ ] PR-ul a primit cel puțin **1 review aprobat**
- [ ] Documentația este actualizată (dacă e cazul)
- [ ] Merge pe `main` prin PR

---

## 6. GitHub Workflow — Metoda Unificată de Lucru

### 6.1 Structura de Branch-uri

```
main (protejat — NICIODATĂ push direct)
 ├── develop (branch de integrare)
 │    ├── feature/BE-auth-login
 │    ├── feature/FE-kanban-board
 │    ├── feature/FE-calendar-view
 │    ├── bugfix/task-deadline-cron
 │    └── hotfix/critical-auth-fix
```

**Convenție de denumire branch-uri:**
- `feature/<ROL>-<descriere-scurtă>` — funcționalitate nouă
- `bugfix/<descriere-scurtă>` — corectare bug
- `hotfix/<descriere-scurtă>` — fix critic pe producție

### 6.2 Setup Inițial (o singură dată)

```bash
# Clonează repository-ul
git clone https://github.com/AndreiLungu64/collaborative-to-do-list.git
cd collaborative-to-do-list

# Verifică remote-ul
git remote -v
# origin  https://github.com/AndreiLungu64/collaborative-to-do-list.git (fetch)
# origin  https://github.com/AndreiLungu64/collaborative-to-do-list.git (push)

# Creează și switch pe branch-ul develop (dacă nu există)
git checkout -b develop
git push origin develop
```

> [!IMPORTANT]
> Toți membrii echipei sunt adăugați ca **Collaborators** pe repo. Dacă nu poți face push, verifică:
> 1. Ai acceptat invitația de Collaborator (check email / GitHub notifications)
> 2. Ești autentificat corect: `git config user.name` și `git config user.email`
> 3. Folosești HTTPS cu Personal Access Token sau SSH key configurat

### 6.3 Workflow Pas cu Pas (toți membrii)

```bash
# 1. Preia ultimele modificări
git checkout develop
git pull origin develop

# 2. Creează branch din develop
git checkout -b feature/BE-task-crud

# 3. Lucrează, commitează des cu mesaje descriptive
git add .
git commit -m "feat(tasks): am adaugat endpoint-urile CRUD pt taskuri"

# 4. Push pe remote
git push origin feature/BE-task-crud

# 5. Deschide Pull Request pe GitHub:
#    https://github.com/AndreiLungu64/collaborative-to-do-list/compare/develop...feature/BE-task-crud
#    - Leagă PR-ul de Issue-ul corespunzător (#12)
#    - Adaugă ALȚI colegi ca reviewers (NU te pune pe tine)
#    - Așteaptă CI verde + aprobare de la colegi

# 6. După merge → șterge branch-ul
git branch -d feature/BE-task-crud
```

### 6.4 Reguli de Review pe Pull Requests

> [!CAUTION]
> **NU poți aproba propriul PR!** Cine face PR-ul **NU** poate fi reviewer-ul. E ca și cum ți-ai corecta singur testul — nu are sens. Trebuie ca **cel puțin 1 coleg** (alt membru din echipă) să facă review și să aprobe.

#### Cine face review la cine

| Cine face PR | Cine face review (minim 1) | De ce |
|---|---|---|
| **Backend Dev** | Frontend Dev sau QA | Frontend-ul trebuie să știe ce endpoint-uri primește; QA verifică logica |
| **Frontend Dev** | Backend Dev sau QA | Backend-ul confirmă că API-ul e consumat corect; QA verifică UX-ul |
| **QA Engineer** | Backend Dev sau Frontend Dev | Ceilalți verifică că testele sunt relevante și nu au false positives |
| **DevOps** | Oricine din echipă | Toți trebuie să înțeleagă cum funcționează Docker/CI |

#### Pașii unui PR complet

```
1. Faci push pe branch-ul tău
       ↓
2. Deschizi PR pe GitHub → develop
       ↓
3. Completezi descrierea PR-ului:
   - Ce ai făcut (2-3 propoziții)
   - Ce Issue rezolvă: "Closes #15"
   - Cum se testează (dacă e cazul)
       ↓
4. Adaugi ca Reviewers: 1-2 colegi (NU pe tine!)
       ↓
5. Aștepți:
   ✅ CI-ul trece (build + teste automate)
   ✅ Cel puțin 1 coleg aprobă review-ul
       ↓
6. Colegul dă "Approve" sau lasă comentarii
   - Dacă are comentarii → rezolvi, pushezi din nou
   - Dacă aprobă → merge pe develop
       ↓
7. Merge! 🎉 Șterge branch-ul.
```

> [!TIP]
> **Template rapid pentru descrierea PR-ului:**
> ```
> ## Ce am făcut
> Am adăugat endpoint-urile de login și register cu JWT.
>
> ## Issue
> Closes #15
>
> ## Cum testezi
> 1. Rulează `docker compose up`
> 2. Trimite POST la `localhost:5000/api/auth/login` cu body-ul din README
> 3. Primești token JWT
> ```

### 6.5 Convenție Commit Messages

> [!IMPORTANT]
> **Fiecare push TREBUIE să conțină un comentariu scurt și explicativ** despre ce s-a făcut. Fără commit-uri goale sau cu mesaje gen "update", "fix", "asdf". Comentariile sunt **în română**, scurte, la obiect — ca și cum i-ai explica unui coleg ce ai schimbat.

Folosim formatul **`tip(zona): explicatie scurta`**:

```
Tipuri:
  feat     — ceva nou adaugat
  fix      — am reparat un bug
  docs     — documentatie
  style    — formatare (fara schimbari de logica)
  refactor — am rescris cod, dar face acelasi lucru
  test     — teste noi sau modificate
  chore    — config, dependencies, chestii administrative
  ci       — modificari CI/CD

✅ Exemple BUNE:
  feat(auth): am adaugat login-ul cu JWT, merge sa te loghezi acum
  fix(tasks): am rezolvat bug-ul cu timezone-ul la deadline
  feat(kanban): am pus drag and drop pe coloane, acum poti muta taskuri
  fix(calendar): nu se mai afisau taskurile din weekend, am fixat query-ul
  test(tasks): am scris teste pt crearea de taskuri
  chore(docker): am updatat dockerfile-ul pt backend
  docs(readme): am pus instructiunile de setup pt echipa
  feat(tasks): am facut formularul de creare task cu toate campurile
  fix(auth): token-ul expira corect acum, nu mai da 401 random
  refactor(api): am mutat logica din controller in service, e mai curat acum
  ci(github): am adaugat pipeline-ul de CI sa ruleze testele pe PR

❌ Exemple PROASTE (NU asa):
  update
  fix stuff
  asdkjahsd
  changes
  merge
  test
  .
```

> [!TIP]
> **Regula de bază**: dacă un coleg se uită la commit-ul tău și nu înțelege ce ai făcut fără să deschidă codul, mesajul e prost. Scrie 5-10 cuvinte care explică treaba.

### 6.6 GitHub Issues & Projects

- **Fiecare funcționalitate** = un Issue pe GitHub
- Issue-urile au **labels**: `backend`, `frontend`, `qa`, `devops`, `bug`, `feature`
- Issue-urile au **assignee**: persoana responsabilă
- Issue-urile sunt organizate într-un **GitHub Projects board** (Kanban) gestionat de Team Lead: [Projects →](https://github.com/AndreiLungu64/collaborative-to-do-list/projects)
- PR-urile **referențiază** Issue-ul: `Closes #12` în descrierea PR-ului
- Issues se creează aici: [New Issue →](https://github.com/AndreiLungu64/collaborative-to-do-list/issues/new)

### 6.7 Cum Funcționează Dezvoltarea în Paralel (4 Branch-uri Simultane)

Toți 4 membrii lucrează **simultan**, fiecare pe propriul branch. Nimeni nu așteaptă pe altcineva să termine — lucrați în paralel și vă sincronizați prin **`develop`**.

#### Scenariul Real: Cine lucrează pe ce

```
develop (branch-ul comun unde se integrează tot)
    │
    ├── feature/BE-auth-login        ← Backend Dev lucrează aici
    │       (Express.ts, rute, DB)
    │
    ├── feature/FE-login-page        ← Frontend Dev lucrează aici
    │       (React, componente, UI)
    │
    ├── feature/QA-auth-tests        ← QA lucrează aici
    │       (Cypress, teste E2E)
    │
    └── feature/DEVOPS-ci-pipeline   ← DevOps lucrează aici
            (Docker, GitHub Actions)
```

#### Cum se conectează munca voastră — Fluxul Complet

```
             ① Fiecare lucrează pe branch-ul lui
    ┌──────────────────────────────────────────────────┐
    │                                                  │
    │  BE Dev: feature/BE-auth-login                   │
    │  FE Dev: feature/FE-login-page                   │
    │  QA:     feature/QA-auth-tests                   │
    │  DevOps: feature/DEVOPS-ci-pipeline              │
    │                                                  │
    └──────────────────┬───────────────────────────────┘
                       │
             ② Când ești gata, faci PR → develop
                       │
    ┌──────────────────▼───────────────────────────────┐
    │                                                  │
    │              develop                             │
    │  (aici se adună tot — e branch-ul de integrare)  │
    │                                                  │
    │  PR #1: BE-auth-login   → merged ✅              │
    │  PR #2: DEVOPS-pipeline → merged ✅              │
    │  PR #3: FE-login-page   → merged ✅              │
    │  PR #4: QA-auth-tests   → merged ✅              │
    │                                                  │
    └──────────────────┬───────────────────────────────┘
                       │
             ③ Când totul e stabil, merge develop → main
                       │
    ┌──────────────────▼───────────────────────────────┐
    │              main (producție)                     │
    │         Deploy automat pe cloud                   │
    └──────────────────────────────────────────────────┘
```

#### Ordinea recomandată de merge pe `develop`

Nu toate branch-urile se merguiesc în aceeași ordă. Unele depind de altele:

```
1️⃣  DevOps: feature/DEVOPS-docker-setup
       → Se merge PRIMUL (Docker, CI — nu depinde de nimeni)

2️⃣  Backend: feature/BE-auth-login
       → Se merge AL DOILEA (API-ul trebuie să existe înainte de frontend)

3️⃣  Frontend: feature/FE-login-page
       → Se merge AL TREILEA (frontend-ul consumă API-ul deja din develop)

4️⃣  QA: feature/QA-auth-tests
       → Se merge ULTIMUL (testează totul integrat)
```

> [!IMPORTANT]
> **Regula cheie**: Backend-ul se merguiește pe `develop` **ÎNAINTEA** Frontend-ului. De ce? Pentru că Frontend-ul consumă API-ul. Dacă API-ul nu e încă pe `develop`, Frontend-ul nu are ce apela.

#### Ce faci dacă ai nevoie de cod de pe alt branch (încă ne-merged)

Dacă ești pe Frontend și ai nevoie de API-ul care e încă pe branch-ul de Backend (nu s-a merged pe `develop`):

**Opțiunea 1 — Așteaptă merge pe develop (recomandat)**
```bash
# Cere colegului de Backend să facă PR și merge pe develop
# Apoi preia modificările:
git checkout feature/FE-login-page
git pull origin develop
# Acum ai și codul de Backend în branch-ul tău
```

**Opțiunea 2 — Mock-uiește API-ul temporar**
```javascript
// În frontend, folosește date mock până Backend-ul e pe develop
const mockTasks = [
  { id: 1, title: "Task test", status: "todo" },
  { id: 2, title: "Alt task", status: "in_progress" }
];

// Când API-ul e gata, înlocuiești cu apelul real:
// const tasks = await api.get('/api/tasks');
```

**Opțiunea 3 — Pull din branch-ul colegului (doar dacă e urgent)**
```bash
# Preia direct din branch-ul colegului (NU recomandat, face conflicte)
git checkout feature/FE-login-page
git pull origin feature/BE-auth-login
```

#### Cum se rezolvă conflictele de merge

Conflicte apar când 2 persoane modifică același fișier. La noi e puțin probabil (Backend e în `/backend`, Frontend e în `/frontend`), dar poate apărea la fișiere comune (`docker-compose.yml`, `README.md`, etc.).

```bash
# 1. Actualizează branch-ul tău cu ce e pe develop
git checkout feature/FE-login-page
git pull origin develop

# 2. Dacă apar conflicte, Git îți arată fișierele afectate
#    Deschide fișierele și rezolvă manual (alegi ce păstrezi)

# 3. După ce rezolvi, commitează
git add .
git commit -m "fix(merge): am rezolvat conflictele cu develop"
git push origin feature/FE-login-page
```

> [!TIP]
> **Sfat**: dă `git pull origin develop` pe branch-ul tău **în fiecare zi** sau cel puțin înainte de a face PR. Asta previne conflicte mari. Dacă tragi des, conflictele sunt mici și ușor de rezolvat.

#### Regulile de sincronizare (pentru toți)

| Regulă | De ce |
|---|---|
| Trage `develop` pe branch-ul tău **zilnic** | Ca să nu divergi prea mult și să ai conflicte uriașe |
| Backend se merge pe develop **înaintea** Frontend-ului | Frontend-ul depinde de API |
| DevOps se merge pe develop **primul** | CI/CD trebuie să fie gata ca PR-urile celorlalți să fie testate automat |
| QA se merge pe develop **ultimul** | Testele trebuie să verifice codul deja integrat |
| Fiecare merge pe develop se face prin **PR cu review** | Nimeni nu merge direct, chiar dacă ești sigur că e ok |
| Dacă ceva se strică pe develop, **nu mai merguiți** | Fix-ul prioritar pe develop înainte de orice altceva |

---

## 7. Ghid pentru Fiecare Rol

---

### 7.1 🔧 Backend Developer (Champion)

**Responsabilități principale:**
- Arhitectura API-ului REST (Express.ts)
- Schema și migrările bazei de date (PostgreSQL)
- Logica de business (permisiuni, deadline management)
- Autentificarea (JWT)
- Foloseste limbajul TypeScript, nu JavaScript

**Structura de Foldere:**

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts              # Conexiune PostgreSQL (pg / knex)
│   │   └── env.ts             # Variabile de mediu
│   ├── middleware/
│   │   ├── auth.ts            # Verificare JWT
│   │   ├── isTaskAdmin.ts     # Verificare admin task
│   │   └── errorHandler.ts    # Error handling centralizat
│   ├── routes/
│   │   ├── auth.routes.ts     # /api/auth/*
│   │   └── tasks.routes.ts    # /api/tasks/*
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── tasks.controller.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   └── task.model.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── task.service.ts
│   ├── utils/
│   │   └── deadlineCron.ts    # Job programat pentru deadline zone
│   └── app.ts                 # Express app setup
├── migrations/                # Migrări SQL
├── seeds/                     # Date de test
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
├── package.tson
└── .env.example
```

**Best Practices:**

1. **Separation of Concerns** — Controller → Service → Model. Controller-ul nu conține logică de business.
2. **Validare input** — Folosește `express-validator` sau `joi` pe fiecare endpoint.
3. **Error handling centralizat** — Toate erorile trec prin middleware-ul `errorHandler.ts`. Nu lăsa Express să trimită stack traces în producție.
4. **Variabile de mediu** — NICIODATĂ credențiale hardcodate. Totul în `.env` (care e în `.gitignore`). Oferă `.env.example` colegilor.
5. **Migrări, nu SQL manual** — Folosește `knex migrate` sau `node-pg-migrate` pentru orice schimbare de schemă.
6. **Teste unitare** — Minim pe service layer. Folosește `jest` + `supertest` pentru integration tests pe rute.
7. **Deadline Cron Job** — Implementează cu `node-cron` un job care verifică la fiecare 5 minute task-urile aproape de deadline și le marchează corespunzător.
8. **HTTP Status Codes corecte** — `201` la creare, `200` la success, `401` la neautorizat, `403` la interzis, `404` la negăsit, `422` la validare eșuată.
9. **Logging** — Folosește `morgan` pentru request logging și `winston` pentru application logging.
10. **CORS** — Configurează `cors` middleware strict doar pentru frontend-ul tău.

**Checklist Sprint 0:**
- [ ] Init proiect Express.ts cu structura de foldere
- [ ] Configurare conexiune PostgreSQL
- [ ] Setup migrări (knex / node-pg-migrate)
- [ ] Dockerfile backend (multi-stage build)
- [ ] `.env.example` cu toate variabilele necesare
- [ ] Primele rute de health check (`GET /api/health`)

---

### 7.2 🎨 Frontend Developer (Champion)

**Responsabilități principale:**
- Interfața cu utilizatorul (React)
- Integrare API (axios / fetch)
- State management
- Responsive design
- Containerizare frontend (Docker)

**Structura de Foldere:**

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loader.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   └── TaskCard.tsx
│   │   ├── calendar/
│   │   │   ├── CalendarView.tsx
│   │   │   └── CalendarEvent.tsx
│   │   └── tasks/
│   │       ├── TaskForm.tsx
│   │       ├── TaskDetail.tsx
│   │       └── AccessManager.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx       # Kanban Board principal
│   │   ├── Calendar.tsx        # Calendar view
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── CompletedTasks.tsx
│   ├── context/
│   │   └── AuthContext.tsx     # JWT state global
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useTasks.ts
│   ├── services/
│   │   └── api.ts              # Axios instance + interceptors
│   ├── utils/
│   │   └── dateHelpers.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── Dockerfile
├── package.tson
├── vite.config.ts
└── .env.example
```

**Best Practices:**

1. **Component-Based Architecture** — Componente mici, reutilizabile. Un component = o responsabilitate.
2. **API Layer separat** — Toate apelurile HTTP sunt în `services/api.ts` cu un Axios instance configurat (base URL, interceptors pentru JWT).
3. **Auth cu Context API** — JWT-ul se stochează în `localStorage` și se injectează automat prin Axios interceptor. AuthContext gestionează starea user-ului global.
4. **React Router** — Routing cu `react-router-dom`. Implementează `ProtectedRoute` pentru paginile care necesită autentificare.
5. **Kanban Drag & Drop** — Folosește `@hello-pangea/dnd` (fork menținut de react-beautiful-dnd) pentru drag & drop între coloane.
6. **Calendar** — Folosește `react-big-calendar` sau `@fullcalendar/react` pentru vizualizarea calendaristică.
7. **Responsive Design** — Mobile-first CSS. Dashboard-ul trebuie să funcționeze pe desktop și tabletă (minim).
8. **Loading & Error States** — Fiecare apel API are 3 stări: loading, success, error. Afișează skeleton loaders, nu pagină goală.
9. **Notificări vizuale** — Folosește `react-hot-toast` sau similar pentru feedback la acțiuni (task creat, eroare, etc.).
10. **Dockerfile** — Multi-stage build: `node` pentru build → `nginx` pentru serving fișiere statice.

**Convenție de stilizare:**
```
/* Folosește CSS Modules sau Styled Components — alege una și rămâi consecvent */
/* Eexmplu cu CSS Modules: */
TaskCard.module.css   →   import styles from './TaskCard.module.css'
```

**Culori și Priorități:**
| Prioritate | Culoare | Hex |
|---|---|---|
| Low | Verde | `#22c55e` |
| Medium | Galben | `#facc15` |
| High | Portocaliu | `#f97316` |
| Critical | Roșu | `#ef4444` |
| Overdue | Roșu închis | `#dc2626` (background tint) |

**Checklist Sprint 0:**
- [ ] Init proiect React cu Vite
- [ ] Setup React Router cu paginile de bază (goale)
- [ ] Configurare Axios instance cu base URL din env
- [ ] AuthContext schelet
- [ ] Dockerfile frontend (multi-stage: node → nginx)
- [ ] `.env.example` cu variabilele necesare

---

### 7.3 🧪 QA Engineer / Tester (Champion)

**Responsabilități principale:**
- Scriere User Stories cu Acceptance Criteria **ÎNAINTE** de implementare
- Teste automate (E2E cu Cypress/Playwright, Integration cu Jest)
- Validarea calității pe fiecare PR
- Rapoarte de testare

**Structura de Foldere:**

```
e2e/                             # Teste End-to-End (Cypress sau Playwright)
├── tests/
│   ├── auth.spec.ts             # Login, Register, Logout
│   ├── task-crud.spec.ts        # Creare, Editare, Ștergere
│   ├── kanban-board.spec.ts     # Drag & drop, schimbare status
│   ├── calendar.spec.ts         # Vizualizare task-uri în calendar
│   ├── permissions.spec.ts      # Acces control
│   └── deadline.spec.ts         # Deadline zone, overdue marking
├── fixtures/
│   └── test-data.tson           # Date de test predefinite
├── support/
│   ├── commands.ts              # Custom commands (login, createTask)
│   └── helpers.ts
├── Dockerfile                   # Container separat pentru teste E2E
├── playwright.config.ts         # sau cypress.config.ts
└── package.tson
```

**Best Practices:**

1. **User Stories PRIMELE** — QA definește criteriile de acceptare **înainte** ca backend/frontend să înceapă implementarea. Exemplu:
   ```
   US-001: Creare Task
   CA UN utilizator autentificat
   VREAU SĂ creez un task cu titlu, descriere, deadline, vizibilitate și prioritate
   ASTFEL ÎNCÂT să îmi organizez activitățile

   Criterii de Acceptare:
   ✅ Câmpul titlu este obligatoriu (max 100 caractere)
   ✅ Câmpul deadline este obligatoriu și nu poate fi în trecut
   ✅ Vizibilitatea default este "personal"
   ✅ Prioritatea default este "medium"
   ✅ După creare, task-ul apare în coloana "To Do" a Kanban board-ului
   ✅ După creare, task-ul apare în calendar la data deadline-ului
   ✅ Creatorul devine automat admin-ul task-ului
   ```

2. **Test Pyramid** — Multe teste unitare (backend), câteva integration tests, puține E2E (dar critice).
   ```
   ▲  E2E Tests (Cypress/Playwright) — 5-10 scenarii cheie
   ██  Integration Tests (Jest + Supertest) — 15-20 teste
   ████  Unit Tests (Jest) — 30+ teste
   ```

3. **E2E pe flow-urile critice:**
   - Login → Creare Task → Vizualizare în Kanban → Schimbare status → Done
   - Login → Creare Task public → Adăugare acces utilizator → Verificare vizibilitate
   - Verificare deadline zone (task apare cu 1h înainte)
   - Verificare overdue (task marcat cu roșu după deadline)

4. **Teste pe fiecare PR** — CI-ul rulează toate testele automat. PR-ul nu poate fi merged dacă testele pică.

5. **Test Data Management** — Folosește fixtures și seed-uri dedicate. Testele E2E își creează și șterg propriile date. Nu depind de starea bazei de date.

6. **Bug Reports** — format standard:
   ```
   [BUG] Titlu scurt
   Pași de reproducere: 1. ... 2. ... 3. ...
   Rezultat așteptat: ...
   Rezultat actual: ...
   Severity: Critical / Major / Minor
   Screenshot/Video: atașat
   ```

7. **Code Review din perspectivă QA** — La fiecare PR, verifică:
   - Sunt acoperite cazurile de eroare?
   - Validarea inputului este prezentă?
   - Edge cases tratate? (string gol, date invalide, acces neautorizat)

**Checklist Sprint 0:**
- [ ] Definire User Stories pentru Sprint 1 (Auth + CRUD)
- [ ] Setup framework E2E (Cypress sau Playwright)
- [ ] Scrie cel puțin 2 teste E2E schelet (login + creare task)
- [ ] Template bug report în GitHub Issues
- [ ] Dockerfile pentru test runner

---

### 7.4 🚀 DevOps / Infrastructure (Champion)

**Responsabilități principale:**
- Docker & Docker Compose
- CI/CD Pipeline (GitHub Actions)
- Deploy automat în Cloud
- Monitorizare și logging

**Structura de Foldere:**

```
/ (root)
├── docker-compose.yml           # Orchestrare completă
├── docker-compose.dev.yml       # Override-uri pentru development
├── .github/
│   └── workflows/
│       ├── ci.yml               # Pipeline CI: build + test pe fiecare PR
│       ├── cd.yml               # Pipeline CD: deploy pe merge în main
│       └── e2e.yml              # Pipeline E2E: teste full stack
├── nginx/
│   └── default.conf             # Nginx config pentru frontend (producție)
├── scripts/
│   ├── wait-for-db.sh           # Script așteptare DB ready
│   └── seed-db.sh               # Script populare date inițiale
└── .env.example                 # Template variabile de mediu
```

**Best Practices:**

1. **`docker compose up` = totul pornește** — O singură comandă pornește: Backend, Frontend. Baza de date este **remote** (nu rulează local în Docker).

   ```yaml
   # docker-compose.yml (schelet)
   version: '3.8'
   services:
     backend:
       build: ./backend
       environment:
         DATABASE_URL: ${DATABASE_URL}   # Remote: postgresql://scraper:Scraper123#@38.242.226.83:5432/MPI
         JWT_SECRET: ${JWT_SECRET}
       ports:
         - "5000:5000"

     frontend:
       build: ./frontend
       depends_on:
         - backend
       ports:
         - "3000:80"
   ```

   > [!NOTE]
   > Deoarece baza de date este remote (`38.242.226.83`), **nu** avem nevoie de un serviciu `db` în Docker Compose. Variabila `DATABASE_URL` din `.env` pointează direct la serverul remote.

2. **Multi-stage Docker builds** — Imagine finală cât mai mică. Exemplu backend:
   ```dockerfile
   # Build stage
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.tson ./
   RUN npm ci --only=production

   # Production stage
   FROM node:20-alpine
   WORKDIR /app
   COPY --from=builder /app/node_modules ./node_modules
   COPY . .
   EXPOSE 5000
   CMD ["node", "src/app.ts"]
   ```

3. **GitHub Actions CI Pipeline** (pe fiecare PR):
   ```yaml
   # .github/workflows/ci.yml (schelet)
   name: CI Pipeline
   on:
     pull_request:
       branches: [develop, main]

   jobs:
     lint-and-test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20

         - name: Install & Test Backend
           working-directory: ./backend
           run: |
             npm ci
             npm run lint
             npm test

         - name: Install & Test Frontend
           working-directory: ./frontend
           run: |
             npm ci
             npm run lint
             npm run build

     e2e:
       needs: lint-and-test
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Run E2E Tests
           run: docker compose -f docker-compose.yml -f docker-compose.e2e.yml up --abort-on-container-exit
   ```

4. **CD Pipeline** — Pe merge în `main`, deploy automat pe Render/Railway.

5. **Branch Protection pe `main`:**
   - ✅ Require PR reviews (minim 1)
   - ✅ Require status checks to pass (CI verde)
   - ✅ Require branches to be up to date
   - ❌ Allow force pushes — DEZACTIVAT
   - ❌ Allow deletions — DEZACTIVAT

6. **Secrets Management** — Toate credențialele (DB password, JWT secret, API keys) sunt stocate în **GitHub Secrets**, nu în cod.

7. **Health Checks** — În Docker Compose, adaugă health checks pentru DB și Backend:
   ```yaml
   backend:
     healthcheck:
       test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
       interval: 30s
       timeout: 10s
       retries: 3
   ```

8. **Logging centralizat** — Configurează Docker logging driver sau un serviciu extern (opțional, bonus).

**Checklist Sprint 0:**
- [ ] `docker-compose.yml` funcțional (DB + Backend + Frontend)
- [ ] Dockerfiles pentru Backend și Frontend
- [ ] GitHub Actions: CI pipeline de bază (lint + test + build)
- [ ] Branch protection configurat pe `main`
- [ ] `.env.example` la root
- [ ] README.md cu instrucțiuni de setup

---

### 7.5 👑 Team Lead (Rol Administrativ Extra)

**Responsabilități:**
- Gestionare GitHub Projects board (mută carduri, asignează, prioritizează)
- Facilitare ceremonii Scrum (planning, review, retro)
- Rezolvare conflicte și deblocare colegi
- Asigurare că DoD este respectată pe fiecare PR
- Menținere documentație la zi (README, VISION, etc.)

**Best Practices:**
1. **Sprint Planning** — Asigură-te că fiecare sprint are un obiectiv clar și task-urile sunt estimate (story points sau T-shirt sizing: S/M/L).
2. **Daily Check-in** — Postează zilnic pe grup: *"Ce ai făcut? Ce faci azi? Ești blocat?"*.
3. **PR Review Rotation** — Rotează reviewerii astfel încât toți membrii văd cod de la toți ceilalți.
4. **Backlog Grooming** — Menține backlog-ul ordonat. Issue-urile fără descriere sau acceptance criteria nu intră în sprint.
5. **Velocity Tracking** — La finalul fiecărui sprint, notează câte story points au fost completate. Ajustează planificarea sprint-ului următor.

---

## 8. Setup Proiect — Primii Pași (Sprint 0)

### Ordinea de lucru:

```
Pasul 1 — Team Lead: Configurează GitHub Projects pe repo-ul existent
     │   https://github.com/AndreiLungu64/collaborative-to-do-list
     ↓
Pasul 2 — DevOps: Setup Docker Compose + Dockerfiles
     ↓
Pasul 3 — Backend: Init Express.ts, schema DB, health check
     ↓   (în paralel)
Pasul 3'— Frontend: Init React (Vite), routing schelet
     ↓   (în paralel)
Pasul 3"— QA: Setup test framework, User Stories Sprint 1
     ↓
Pasul 4 — DevOps: GitHub Actions CI + Branch Protection
     ↓
Pasul 5 — Toți: Verificare `docker compose up` pornește totul
```

### Repo Structure Finală:

```
collaborative-todo/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── backend/
│   ├── src/
│   ├── tests/
│   ├── migrations/
│   ├── Dockerfile
│   └── package.tson
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.tson
├── e2e/
│   ├── tests/
│   ├── Dockerfile
│   └── package.tson
├── nginx/
│   └── default.conf
├── scripts/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── .gitignore
├── README.md
└── VISION_DOCUMENT.md          # ← Acest document
```

---

## 9. Reguli Comune pentru Toți

| Regulă | Detaliu |
|---|---|
| **Un PR = un Issue** | Fiecare Pull Request rezolvă exact un Issue |
| **Branch din `develop`** | Niciodată branch direct din `main` |
| **Commit-uri mici și dese** | Max 200 linii schimbate per commit ideal |
| **Comentarii obligatorii la push** | Fiecare commit are mesaj explicativ în română: `feat(zona): ce am facut` |
| **Fără commit-uri gen "update"** | Mesajul trebuie să explice clar ce s-a schimbat, fără mesaje vagi |
| **Review obligatoriu** | Minim 1 review aprobat pe fiecare PR |
| **CI verde = merge** | Nu se merge cu teste picate |
| **Nu lăsa PR-uri deschise >2 zile** | Revizie sau închidere |
| **Comunicare** | Orice blocare se comunică imediat pe chat |
| **Documentație** | README.md actualizat cu instrucțiuni de setup |

---

## 10. Definiții & Glosar

| Termen | Definiție |
|---|---|
| **ALM** | Application Lifecycle Management — ciclul complet de la idee la producție |
| **Champion** | Responsabilul principal pe o arie (nu singurul contributor) |
| **DoD** | Definition of Done — criteriile pentru a considera un task finalizat |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **PR** | Pull Request — cerere de merge a codului |
| **E2E** | End-to-End testing — testare de la UI până la DB |
| **Kanban** | Metodă vizuală de management al lucrului cu coloane |
| **JWT** | JSON Web Token — mecanism de autentificare stateless |

---

> **Ultima actualizare:** 18 Martie 2026  
> **Versiune document:** 1.0  
> **Autori:** Echipa MPI
