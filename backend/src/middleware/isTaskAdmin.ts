/**
 * @module middleware/isTaskAdmin
 * @description Middleware that checks if the authenticated user
 * is the admin (creator) of the requested task.
 * Must be used AFTER auth middleware.
 */
import { Response, NextFunction } from 'express';
import * as db from '../config/db';
import { AuthRequest } from '../types';

const isTaskAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT admin_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Task-ul nu a fost găsit.' });
      return;
    }

    if (result.rows[0].admin_id !== userId) {
      res.status(403).json({ error: 'Nu ai permisiunea de a modifica acest task. Doar admin-ul poate.' });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default isTaskAdmin;
