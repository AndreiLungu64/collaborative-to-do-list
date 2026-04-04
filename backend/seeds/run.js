/**
 * @module seeds/run
 * @description Seeds the database with sample data for development and testing.
 *
 * IDEMPOTENT — safe to run multiple times:
 *   - Clears existing data (task_access → tasks → users) before re-seeding
 *   - Uses a single transaction so the DB stays consistent even on failure
 *
 * Usage:
 *   npm run seed
 *
 * All seed users have password: "parola123"
 */
const { pool } = require('../src/config/db');
const logger = require('../src/utils/logger');
const { getUsers, getTasks, getTaskAccessEntries } = require('./seed-data');

async function seed() {
  const client = await pool.connect();

  try {
    logger.info('[SEED] Pornire seeding baza de date...');
    await client.query('BEGIN');

    // ── 1. Clear existing data (in FK order) ─────────────────────
    logger.info('[SEED] Ștergere date existente...');
    await client.query('DELETE FROM task_access');
    await client.query('DELETE FROM tasks');
    await client.query('DELETE FROM users');

    // Reset sequences so IDs start from 1
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE tasks_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE task_access_id_seq RESTART WITH 1');

    // ── 2. Insert users ──────────────────────────────────────────
    const users = await getUsers();
    const userIds = {};

    for (const user of users) {
      const result = await client.query(
        `INSERT INTO users (username, email, password)
         VALUES ($1, $2, $3)
         RETURNING id, username`,
        [user.username, user.email, user.password]
      );
      userIds[result.rows[0].username] = result.rows[0].id;
      logger.info(`[SEED]   ✓ User: ${result.rows[0].username} (id=${result.rows[0].id})`);
    }

    // ── 3. Insert tasks ──────────────────────────────────────────
    const tasks = getTasks(userIds);
    const insertedTaskIds = [];

    for (const task of tasks) {
      const result = await client.query(
        `INSERT INTO tasks (title, description, status, visibility, priority, deadline, admin_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, title, status`,
        [task.title, task.description, task.status, task.visibility, task.priority, task.deadline, task.admin_id]
      );
      insertedTaskIds.push(result.rows[0].id);
      logger.info(`[SEED]   ✓ Task: "${result.rows[0].title}" [${result.rows[0].status}] (id=${result.rows[0].id})`);
    }

    // ── 4. Insert task_access entries ────────────────────────────
    const accessEntries = getTaskAccessEntries();

    for (const entry of accessEntries) {
      const taskId = insertedTaskIds[entry.taskIndex];
      const userId = userIds[entry.userKey];

      await client.query(
        `INSERT INTO task_access (task_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (task_id, user_id) DO NOTHING`,
        [taskId, userId]
      );
      logger.info(`[SEED]   ✓ Access: task #${taskId} → user "${entry.userKey}" (id=${userId})`);
    }

    // ── 5. Commit ────────────────────────────────────────────────
    await client.query('COMMIT');

    logger.info('[SEED] ════════════════════════════════════════════');
    logger.info(`[SEED] ✅ Seeding complet!`);
    logger.info(`[SEED]    ${users.length} utilizatori`);
    logger.info(`[SEED]    ${tasks.length} task-uri`);
    logger.info(`[SEED]    ${accessEntries.length} permisiuni de acces`);
    logger.info('[SEED] ════════════════════════════════════════════');
    logger.info('[SEED] Credențiale de test:');
    logger.info('[SEED]    Email: andrei@taskflow.dev   Parola: parola123');
    logger.info('[SEED]    Email: maria@taskflow.dev    Parola: parola123');
    logger.info('[SEED]    Email: cristian@taskflow.dev Parola: parola123');
    logger.info('[SEED] ════════════════════════════════════════════');

  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('[SEED] ❌ Seeding eșuat — rollback efectuat', { error: err.message, stack: err.stack });
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
