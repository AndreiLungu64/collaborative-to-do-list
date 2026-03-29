/**
 * @module migrations/run
 * @description Runs the database migration: creates tables if they don't exist.
 * Safe to run multiple times (uses IF NOT EXISTS).
 */
const { pool } = require('../src/config/db');
const logger = require('../src/utils/logger');

const migration = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    description TEXT,
    status      VARCHAR(20) DEFAULT 'todo',
    visibility  VARCHAR(10) DEFAULT 'personal',
    priority    VARCHAR(10) DEFAULT 'medium',
    deadline    TIMESTAMP NOT NULL,
    admin_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Task Access Control (many-to-many)
CREATE TABLE IF NOT EXISTS task_access (
    id          SERIAL PRIMARY KEY,
    task_id     INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(task_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_admin_id ON tasks(admin_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_task_access_task_id ON task_access(task_id);
CREATE INDEX IF NOT EXISTS idx_task_access_user_id ON task_access(user_id);
`;

async function runMigration() {
  try {
    logger.info('Running database migration...');
    await pool.query(migration);
    logger.info('Migration completed successfully!');
  } catch (err) {
    logger.error('Migration failed', { error: err.message });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
