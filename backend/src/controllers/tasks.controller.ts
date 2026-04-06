/**
 * @module controllers/tasks.controller
 * @description HTTP layer for task endpoints.
 * Validates input, delegates to TaskService, returns appropriate HTTP codes.
 */
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import TaskService from '../services/task.service';
import { AuthRequest } from '../types';

const TasksController = {
  /**
   * GET /api/tasks
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const tasks = await TaskService.getVisibleTasks(authReq.user.id);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/tasks
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }

      const authReq = req as AuthRequest;
      const { title, description, deadline, visibility, priority } = req.body;
      const task = await TaskService.createTask(
        { title, description, deadline, visibility, priority },
        authReq.user.id
      );

      res.status(201).json({ message: 'Task creat cu succes!', task });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/tasks/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const task = await TaskService.getTask(parseInt(String(req.params.id)), authReq.user.id);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/tasks/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }

      const { title, description, deadline, visibility, priority } = req.body;
      const task = await TaskService.updateTask(parseInt(String(req.params.id)), {
        title, description, deadline, visibility, priority,
      });

      res.json({ message: 'Task actualizat!', task });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/tasks/:id
   */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await TaskService.deleteTask(parseInt(String(req.params.id)));
      res.json({ message: 'Task șters cu succes.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/tasks/:id/status
   */
  async changeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const { status } = req.body;
      const task = await TaskService.changeStatus(
        parseInt(String(req.params.id)),
        status,
        authReq.user.id
      );
      res.json({ message: 'Status actualizat!', task });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/tasks/:id/access
   */
  async grantAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const access = await TaskService.grantAccess(
        parseInt(String(req.params.id)),
        parseInt(userId)
      );
      res.status(201).json({ message: 'Acces acordat!', access });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/tasks/:id/access/:userId
   */
  async revokeAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await TaskService.revokeAccess(
        parseInt(String(req.params.id)),
        parseInt(String(req.params.userId))
      );
      res.json({ message: 'Acces revocat.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/tasks/deadline
   */
  async deadlineZone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await TaskService.getDeadlineZone();
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/tasks/calendar?start=...&end=...
   */
  async calendar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { start, end } = req.query;
      if (!start || !end) {
        res.status(422).json({ error: 'Parametrii start și end sunt obligatorii.' });
        return;
      }
      const authReq = req as AuthRequest;
      const tasks = await TaskService.getCalendarTasks(authReq.user.id, start as string, end as string);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },
};

export default TasksController;
