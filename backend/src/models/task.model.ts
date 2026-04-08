/**
 * @module models/task.model
 * @description Data access layer for tasks and task_access tables.
 * Handles the full lifecycle: CRUD + access control + deadline queries.
 */
import * as db from '../config/db';
import { Task, TaskInput, AccessUser, TaskAccess } from '../types';

interface CreateTaskData extends TaskInput {
  admin_id: number;
}

const TaskModel = {
  /**
   * Create a new task.
   */
  async create({ title, description, deadline, visibility, priority, admin_id }: CreateTaskData): Promise<Task> {
    const result = await db.query(
      `INSERT INTO tasks (title, description, deadline, visibility, priority, admin_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, deadline, visibility || 'personal', priority || 'medium', admin_id]
    );
    return result.rows[0];
  },

  /**
   * Get a task by ID.
   */
  async findById(id: number): Promise<Task | null> {
    const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  /**
   * Get all tasks visible to a user:
   * - Tasks they created (admin_id)
   * - Public tasks
   * - Tasks they have explicit access to
   */
  async findVisibleByUser(userId: number): Promise<Task[]> {
    const result = await db.query(
      `SELECT DISTINCT t.*, u.username AS admin_username
       FROM tasks t
       JOIN users u ON t.admin_id = u.id
       LEFT JOIN task_access ta ON t.id = ta.task_id
       WHERE t.admin_id = $1
          OR t.visibility = 'public'
          OR ta.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  /**
   * Update a task.
   */
  async update(id: number, { title, description, deadline, visibility, priority }: Partial<TaskInput>): Promise<Task> {
    const result = await db.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           deadline = COALESCE($3, deadline),
           visibility = COALESCE($4, visibility),
           priority = COALESCE($5, priority),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, description, deadline, visibility, priority, id]
    );
    return result.rows[0];
  },

  /**
   * Update task status.
   */
  async updateStatus(id: number, status: string): Promise<Task> {
    const result = await db.query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  /**
   * Delete a task.
   */
  async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Get tasks within the deadline zone (< 1 hour remaining).
   */
  async findDeadlineZone(): Promise<Task[]> {
    const result = await db.query(
      `SELECT t.*, u.username AS admin_username
       FROM tasks t
       JOIN users u ON t.admin_id = u.id
       WHERE t.status NOT IN ('completed', 'overdue')
         AND t.deadline BETWEEN NOW() AND NOW() + INTERVAL '1 hour'
       ORDER BY t.deadline ASC`
    );
    return result.rows;
  },

  /**
   * Get overdue tasks (deadline passed, not completed).
   */
  async findOverdue(): Promise<Task[]> {
    const result = await db.query(
      `SELECT * FROM tasks
       WHERE status NOT IN ('completed', 'overdue')
         AND deadline < NOW()`
    );
    return result.rows;
  },

  /**
   * Mark overdue tasks — used by the cron job.
   */
  async markOverdue(): Promise<number> {
    const result = await db.query(
      `UPDATE tasks SET status = 'overdue', updated_at = NOW()
       WHERE status NOT IN ('completed', 'overdue')
         AND deadline < NOW()`
    );
    return result.rowCount ?? 0;
  },

  /**
   * Get tasks for calendar view (within a date range).
   */
  async findForCalendar(userId: number, startDate: string, endDate: string): Promise<Task[]> {
    const result = await db.query(
      `SELECT DISTINCT t.*, u.username AS admin_username,
       (t.status = 'overdue' OR (t.deadline < NOW() AND t.status != 'completed')) AS "isOverdue"
       FROM tasks t
       JOIN users u ON t.admin_id = u.id
       LEFT JOIN task_access ta ON t.id = ta.task_id
       WHERE (t.admin_id = $1 OR t.visibility = 'public' OR ta.user_id = $1)
         AND t.deadline >= $2 AND t.deadline <= $3
         AND t.status != 'completed'
       ORDER BY t.deadline ASC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  },

  // ─── Access Control ───

  /**
   * Grant a user access to a task.
   */
  async grantAccess(taskId: number, userId: number): Promise<TaskAccess> {
    const result = await db.query(
      `INSERT INTO task_access (task_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (task_id, user_id) DO NOTHING
       RETURNING *`,
      [taskId, userId]
    );
    return result.rows[0];
  },

  /**
   * Revoke a user's access to a task.
   */
  async revokeAccess(taskId: number, userId: number): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM task_access WHERE task_id = $1 AND user_id = $2',
      [taskId, userId]
    );
    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Check if a user has access to a task.
   */
  async hasAccess(taskId: number, userId: number): Promise<boolean> {
    const task = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (!task.rows[0]) return false;

    const t = task.rows[0];
    // Admin always has access
    if (t.admin_id === userId) return true;
    // Public tasks are visible to all
    if (t.visibility === 'public') return true;

    // Check explicit access
    const access = await db.query(
      'SELECT * FROM task_access WHERE task_id = $1 AND user_id = $2',
      [taskId, userId]
    );
    return access.rows.length > 0;
  },

  /**
   * Get all users who have access to a task.
   */
  async getAccessList(taskId: number): Promise<AccessUser[]> {
    const result = await db.query(
      `SELECT u.id, u.username, u.email
       FROM task_access ta
       JOIN users u ON ta.user_id = u.id
       WHERE ta.task_id = $1`,
      [taskId]
    );
    return result.rows;
  },
};

export default TaskModel;
