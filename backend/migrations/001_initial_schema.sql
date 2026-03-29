-- Migration: 001_initial_schema
-- Descriere: Schema initiala - tabele users, tasks, task_access
-- Data: 2026-03-29
-- Autor: Sprint 0 Setup

BEGIN;

-- ========================================
-- Tabel de tracking migrari
-- ========================================
CREATE TABLE IF NOT EXISTS migrations (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) UNIQUE NOT NULL,
    applied_at  TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- Users Table
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,  -- bcrypt hashed
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- Tasks Table
-- ========================================
CREATE TABLE IF NOT EXISTS tasks (
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

-- ========================================
-- Task Access Control (many-to-many)
-- ========================================
CREATE TABLE IF NOT EXISTS task_access (
    id          SERIAL PRIMARY KEY,
    task_id     INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(task_id, user_id)
);

-- ========================================
-- Indexes for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_tasks_admin_id ON tasks(admin_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_visibility ON tasks(visibility);
CREATE INDEX IF NOT EXISTS idx_task_access_task_id ON task_access(task_id);
CREATE INDEX IF NOT EXISTS idx_task_access_user_id ON task_access(user_id);

-- ========================================
-- Inregistreaza migratia
-- ========================================
INSERT INTO migrations (name) VALUES ('001_initial_schema')
ON CONFLICT (name) DO NOTHING;

COMMIT;
