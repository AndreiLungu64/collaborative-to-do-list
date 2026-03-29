/**
 * @module controllers/tasks.controller
 * @description HTTP layer for task endpoints.
 * Validates input, delegates to TaskService, returns appropriate HTTP codes.
 */
const { validationResult } = require('express-validator');
const TaskService = require('../services/task.service');

const TasksController = {
  /**
   * GET /api/tasks
   */
  async list(req, res, next) {
    try {
      const tasks = await TaskService.getVisibleTasks(req.user.id);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/tasks
   */
  async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const { title, description, deadline, visibility, priority } = req.body;
      const task = await TaskService.createTask(
        { title, description, deadline, visibility, priority },
        req.user.id
      );

      res.status(201).json({ message: 'Task creat cu succes!', task });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/tasks/:id
   */
  async getById(req, res, next) {
    try {
      const task = await TaskService.getTask(parseInt(req.params.id), req.user.id);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/tasks/:id
   */
  async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const { title, description, deadline, visibility, priority } = req.body;
      const task = await TaskService.updateTask(parseInt(req.params.id), {
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
  async remove(req, res, next) {
    try {
      await TaskService.deleteTask(parseInt(req.params.id));
      res.json({ message: 'Task șters cu succes.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/tasks/:id/status
   */
  async changeStatus(req, res, next) {
    try {
      const { status } = req.body;
      const task = await TaskService.changeStatus(
        parseInt(req.params.id),
        status,
        req.user.id
      );
      res.json({ message: 'Status actualizat!', task });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/tasks/:id/access
   */
  async grantAccess(req, res, next) {
    try {
      const { userId } = req.body;
      const access = await TaskService.grantAccess(
        parseInt(req.params.id),
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
  async revokeAccess(req, res, next) {
    try {
      await TaskService.revokeAccess(
        parseInt(req.params.id),
        parseInt(req.params.userId)
      );
      res.json({ message: 'Acces revocat.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/tasks/deadline
   */
  async deadlineZone(req, res, next) {
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
  async calendar(req, res, next) {
    try {
      const { start, end } = req.query;
      if (!start || !end) {
        return res.status(422).json({ error: 'Parametrii start și end sunt obligatorii.' });
      }
      const tasks = await TaskService.getCalendarTasks(req.user.id, start, end);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = TasksController;
