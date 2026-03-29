/**
 * @module middleware/isTaskAdmin
 * @description Middleware that checks if the authenticated user
 * is the admin (creator) of the requested task.
 * Must be used AFTER auth middleware.
 */
const db = require('../config/db');

const isTaskAdmin = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT admin_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task-ul nu a fost găsit.' });
    }

    if (result.rows[0].admin_id !== userId) {
      return res.status(403).json({ error: 'Nu ai permisiunea de a modifica acest task. Doar admin-ul poate.' });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = isTaskAdmin;
