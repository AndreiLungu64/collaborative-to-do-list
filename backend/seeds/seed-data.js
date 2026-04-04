/**
 * @module seeds/seed-data
 * @description Sample data for development and testing.
 * Contains 3 users and 15 tasks across all statuses, priorities,
 * visibilities, and deadline ranges (past, deadline zone, future).
 *
 * Passwords are bcrypt-hashed at runtime so they stay in sync
 * with the SALT_ROUNDS used everywhere else in the app.
 */
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash a password with the same config used in AuthService.
 * @param {string} plaintext
 * @returns {Promise<string>}
 */
const hashPassword = (plaintext) => bcrypt.hash(plaintext, SALT_ROUNDS);

/**
 * Helper — returns a Date offset from now.
 * @param {number} hours - positive = future, negative = past
 * @returns {Date}
 */
const hoursFromNow = (hours) => {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
};

/**
 * Return the user seed rows.
 * Each user has password "parola123" so testers can log in easily.
 * @returns {Promise<Array>}
 */
const getUsers = async () => {
  const password = await hashPassword('parola123');
  return [
    { username: 'andrei',  email: 'andrei@taskflow.dev',  password },
    { username: 'maria',   email: 'maria@taskflow.dev',   password },
    { username: 'cristian', email: 'cristian@taskflow.dev', password },
  ];
};

/**
 * Return the task seed rows.
 * admin_id values (1, 2, 3) correspond to the order users are inserted.
 * Deadlines are computed relative to NOW so the data always makes sense.
 *
 * Mix:
 *  - 3 overdue   (deadline in the past, status != completed)
 *  - 2 deadline zone (deadline < 1h from now)
 *  - 4 todo      (deadline well in the future)
 *  - 3 in_progress
 *  - 3 completed
 *
 * @param {Object} userIds - { andrei: id, maria: id, cristian: id }
 * @returns {Array}
 */
const getTasks = (userIds) => [
  // ── Overdue tasks (deadline in the past) ───────────────────────
  {
    title: 'Configurare CI/CD pipeline',
    description: 'Setare GitHub Actions pentru build + test automat pe fiecare PR.',
    status: 'overdue',
    visibility: 'public',
    priority: 'high',
    deadline: hoursFromNow(-48),
    admin_id: userIds.andrei,
  },
  {
    title: 'Documentare endpoints API',
    description: 'Scrie documentația pentru toate endpoint-urile REST din backend.',
    status: 'overdue',
    visibility: 'personal',
    priority: 'medium',
    deadline: hoursFromNow(-24),
    admin_id: userIds.maria,
  },
  {
    title: 'Fix timezone bug pe deadline',
    description: 'Deadline-urile sunt salvate fără timezone, trebuie adăugat UTC.',
    status: 'overdue',
    visibility: 'public',
    priority: 'critical',
    deadline: hoursFromNow(-2),
    admin_id: userIds.cristian,
  },

  // ── Deadline Zone tasks (< 1 hour from now) ───────────────────
  {
    title: 'Review PR #42 — auth middleware',
    description: 'Review la PR-ul lui Andrei cu refactorizarea middleware-ului de autentificare.',
    status: 'in_progress',
    visibility: 'public',
    priority: 'high',
    deadline: hoursFromNow(0.5),
    admin_id: userIds.maria,
  },
  {
    title: 'Actualizare README cu instrucțiuni Docker',
    description: 'Adaugă pașii de setup cu Docker Compose în README.',
    status: 'todo',
    visibility: 'personal',
    priority: 'medium',
    deadline: hoursFromNow(0.75),
    admin_id: userIds.andrei,
  },

  // ── To Do tasks (future deadlines) ────────────────────────────
  {
    title: 'Implementare forgot password',
    description: 'Endpoint POST /api/auth/forgot-password care trimite email cu link de resetare.',
    status: 'todo',
    visibility: 'personal',
    priority: 'low',
    deadline: hoursFromNow(72),
    admin_id: userIds.andrei,
  },
  {
    title: 'Adăugare filtrare task-uri după prioritate',
    description: 'Query param `priority=high` pe GET /api/tasks.',
    status: 'todo',
    visibility: 'public',
    priority: 'medium',
    deadline: hoursFromNow(120),
    admin_id: userIds.maria,
  },
  {
    title: 'Setup Playwright pentru teste E2E',
    description: 'Configurare Playwright cu test fixtures și custom commands.',
    status: 'todo',
    visibility: 'public',
    priority: 'high',
    deadline: hoursFromNow(168),
    admin_id: userIds.cristian,
  },
  {
    title: 'Optimizare query-uri SQL cu EXPLAIN ANALYZE',
    description: 'Rulare EXPLAIN pe query-urile din task.model.js și adăugare indexuri dacă e nevoie.',
    status: 'todo',
    visibility: 'personal',
    priority: 'low',
    deadline: hoursFromNow(240),
    admin_id: userIds.andrei,
  },

  // ── In Progress tasks ─────────────────────────────────────────
  {
    title: 'Refactorizare TaskService — separare logica de permisiuni',
    description: 'Mutare verificări de acces într-un PermissionService dedicat.',
    status: 'in_progress',
    visibility: 'personal',
    priority: 'medium',
    deadline: hoursFromNow(48),
    admin_id: userIds.andrei,
  },
  {
    title: 'Integrare calendar cu API-ul de task-uri',
    description: 'Frontend-ul trebuie să consume GET /api/tasks/calendar cu parametrii start/end.',
    status: 'in_progress',
    visibility: 'public',
    priority: 'high',
    deadline: hoursFromNow(36),
    admin_id: userIds.maria,
  },
  {
    title: 'Implementare drag & drop pe Kanban board',
    description: 'Folosire @hello-pangea/dnd pentru mutarea task-urilor între coloane.',
    status: 'in_progress',
    visibility: 'public',
    priority: 'critical',
    deadline: hoursFromNow(24),
    admin_id: userIds.cristian,
  },

  // ── Completed tasks ───────────────────────────────────────────
  {
    title: 'Setup Express.js cu structura de foldere',
    description: 'Init proiect, configurare middleware, structură controller/service/model.',
    status: 'completed',
    visibility: 'public',
    priority: 'critical',
    deadline: hoursFromNow(-96),
    admin_id: userIds.andrei,
  },
  {
    title: 'Implementare login și register cu JWT',
    description: 'Endpoints POST /api/auth/login și /api/auth/register cu bcrypt + JWT.',
    status: 'completed',
    visibility: 'public',
    priority: 'high',
    deadline: hoursFromNow(-72),
    admin_id: userIds.andrei,
  },
  {
    title: 'Creare schema bază de date și migrări',
    description: 'Tabele users, tasks, task_access cu indexuri și constraints.',
    status: 'completed',
    visibility: 'personal',
    priority: 'high',
    deadline: hoursFromNow(-120),
    admin_id: userIds.cristian,
  },
];

/**
 * Task access entries — which users get access to which tasks.
 * taskIndex refers to the position in the getTasks() array (0-based).
 * userKey refers to the key in the userIds object.
 */
const getTaskAccessEntries = () => [
  // Public tasks with explicit access grants
  { taskIndex: 0, userKey: 'maria' },     // CI/CD pipeline — maria can see
  { taskIndex: 0, userKey: 'cristian' },   // CI/CD pipeline — cristian can see
  { taskIndex: 3, userKey: 'andrei' },     // Review PR — andrei can see
  { taskIndex: 3, userKey: 'cristian' },   // Review PR — cristian can see
  { taskIndex: 7, userKey: 'andrei' },     // Setup Playwright — andrei can see
  { taskIndex: 7, userKey: 'maria' },      // Setup Playwright — maria can see
  { taskIndex: 11, userKey: 'andrei' },    // Drag & drop — andrei can see
  { taskIndex: 11, userKey: 'maria' },     // Drag & drop — maria can see
];

module.exports = { getUsers, getTasks, getTaskAccessEntries };
