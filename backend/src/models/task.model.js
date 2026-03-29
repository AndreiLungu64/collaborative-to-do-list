/**
 * @module models/task.model
 * @description Data access layer for tasks and task_access tables.
 * Handles the full lifecycle: CRUD + access control + deadline queries.
 */
const db = require('../config/db');

const TaskModel = {
  /**
   * Create a new task.
   * @param {{ title, description, deadline, visibility, priority, admin_id }} data
   * @returns {Promise<Object>} Created task
   */
  async create({ title, description, deadline, visibility, priority, admin_id }) {
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
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  /**
   * Get all tasks visible to a user:
   * - Tasks they created (admin_id)
   * - Public tasks
   * - Tasks they have explicit access to
   */
  async findVisibleByUser(userId) {
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
   * @param {number} id
   * @param {{ title, description, deadline, visibility, priority }} data
   * @returns {Promise<Object>} Updated task
   */
  async update(id, { title, description, deadline, visibility, priority }) {
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
   * @param {number} id
   * @param {string} status - todo|in_progress|completed|overdue
   * @returns {Promise<Object>}
   */
  async updateStatus(id, status) {
    const result = await db.query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  /**
   * Delete a task.
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const result = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  /**
   * Get tasks within the deadline zone (< 1 hour remaining).
   * @returns {Promise<Array>}
   */
  async findDeadlineZone() {
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
   * @returns {Promise<Array>}
   */
  async findOverdue() {
    const result = await db.query(
      `SELECT * FROM tasks
       WHERE status NOT IN ('completed', 'overdue')
         AND deadline < NOW()`
    );
    return result.rows;
  },

  /**
   * Mark overdue tasks — used by the cron job.
   * @returns {Promise<number>} Number of tasks marked
   */
  async markOverdue() {
    const result = await db.query(
      `UPDATE tasks SET status = 'overdue', updated_at = NOW()
       WHERE status NOT IN ('completed', 'overdue')
         AND deadline < NOW()`
    );
    return result.rowCount;
  },

  /**
   * Get tasks for calendar view (within a date range).
   * @param {number} userId
   * @param {string} startDate
   * @param {string} endDate
   */
  async findForCalendar(userId, startDate, endDate) {
    const result = await db.query(
      `SELECT DISTINCT t.*, u.username AS admin_username
       FROM tasks t
       JOIN users u ON t.admin_id = u.id
       LEFT JOIN task_access ta ON t.id = ta.task_id
       WHERE (t.admin_id = $1 OR t.visibility = 'public' OR ta.user_id = $1)
         AND t.deadline >= $2 AND t.deadline <= $3
       ORDER BY t.deadline ASC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  },

  // ─── Access Control ───

  /**
   * Grant a user access to a task.
   * @param {number} taskId
   * @param {number} userId
   */
  async grantAccess(taskId, userId) {
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
   * @param {number} taskId
   * @param {number} userId
   */
  async revokeAccess(taskId, userId) {
    const result = await db.query(
      'DELETE FROM task_access WHERE task_id = $1 AND user_id = $2',
      [taskId, userId]
    );
    return result.rowCount > 0;
  },

  /**
   * Check if a user has access to a task.
   * @param {number} taskId
   * @param {number} userId
   * @returns {Promise<boolean>}
   */
  async hasAccess(taskId, userId) {
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
   * @param {number} taskId
   * @returns {Promise<Array>}
   */
  async getAccessList(taskId) {
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

module.exports = TaskModel;
