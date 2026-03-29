/**
 * @module services/task.service
 * @description Business logic for task operations.
 * Orchestrates model calls and enforces permissions.
 */
const TaskModel = require('../models/task.model');

const TaskService = {
  /**
   * Create a new task. Creator becomes admin automatically.
   */
  async createTask(data, userId) {
    const task = await TaskModel.create({
      ...data,
      admin_id: userId,
    });
    return task;
  },

  /**
   * Get all tasks visible to a specific user.
   */
  async getVisibleTasks(userId) {
    const tasks = await TaskModel.findVisibleByUser(userId);
    // Attach access list to each task
    const enriched = await Promise.all(
      tasks.map(async (task) => {
        const accessList = await TaskModel.getAccessList(task.id);
        return { ...task, accessList };
      })
    );
    return enriched;
  },

  /**
   * Get a single task with access check.
   */
  async getTask(taskId, userId) {
    const hasAccess = await TaskModel.hasAccess(taskId, userId);
    if (!hasAccess) {
      const err = new Error('Nu ai acces la acest task.');
      err.statusCode = 403;
      throw err;
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      const err = new Error('Task-ul nu a fost găsit.');
      err.statusCode = 404;
      throw err;
    }

    const accessList = await TaskModel.getAccessList(taskId);
    return { ...task, accessList };
  },

  /**
   * Update a task (admin only — enforced at middleware level).
   */
  async updateTask(taskId, data) {
    const task = await TaskModel.update(taskId, data);
    if (!task) {
      const err = new Error('Task-ul nu a fost găsit.');
      err.statusCode = 404;
      throw err;
    }
    return task;
  },

  /**
   * Change task status (move between Kanban columns).
   */
  async changeStatus(taskId, status, userId) {
    const hasAccess = await TaskModel.hasAccess(taskId, userId);
    if (!hasAccess) {
      const err = new Error('Nu ai acces la acest task.');
      err.statusCode = 403;
      throw err;
    }

    const validStatuses = ['todo', 'in_progress', 'completed', 'overdue'];
    if (!validStatuses.includes(status)) {
      const err = new Error(`Status invalid. Statusuri valide: ${validStatuses.join(', ')}`);
      err.statusCode = 422;
      throw err;
    }

    return TaskModel.updateStatus(taskId, status);
  },

  /**
   * Delete a task (admin only — enforced at middleware level).
   */
  async deleteTask(taskId) {
    const deleted = await TaskModel.delete(taskId);
    if (!deleted) {
      const err = new Error('Task-ul nu a fost găsit.');
      err.statusCode = 404;
      throw err;
    }
    return true;
  },

  /**
   * Get tasks near deadline (< 1 hour).
   */
  async getDeadlineZone() {
    return TaskModel.findDeadlineZone();
  },

  /**
   * Get tasks for calendar within a date range.
   */
  async getCalendarTasks(userId, startDate, endDate) {
    return TaskModel.findForCalendar(userId, startDate, endDate);
  },

  /**
   * Grant a user access to a task.
   */
  async grantAccess(taskId, userId) {
    return TaskModel.grantAccess(taskId, userId);
  },

  /**
   * Revoke access from a user.
   */
  async revokeAccess(taskId, userId) {
    const revoked = await TaskModel.revokeAccess(taskId, userId);
    if (!revoked) {
      const err = new Error('Utilizatorul nu avea acces la acest task.');
      err.statusCode = 404;
      throw err;
    }
    return true;
  },
};

module.exports = TaskService;
