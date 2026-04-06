/**
 * @module services/task.service
 * @description Business logic for task operations.
 * Orchestrates model calls and enforces permissions.
 */
import TaskModel from '../models/task.model';
import { Task, TaskInput, TaskAccess, AppError } from '../types';

const TaskService = {
  /**
   * Create a new task. Creator becomes admin automatically.
   */
  async createTask(data: TaskInput, userId: number): Promise<Task> {
    const task = await TaskModel.create({
      ...data,
      admin_id: userId,
    });
    return task;
  },

  /**
   * Get all tasks visible to a specific user.
   */
  async getVisibleTasks(userId: number): Promise<Task[]> {
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
  async getTask(taskId: number, userId: number): Promise<Task> {
    const hasAccess = await TaskModel.hasAccess(taskId, userId);
    if (!hasAccess) {
      const err = new Error('Nu ai acces la acest task.') as AppError;
      err.statusCode = 403;
      throw err;
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      const err = new Error('Task-ul nu a fost găsit.') as AppError;
      err.statusCode = 404;
      throw err;
    }

    const accessList = await TaskModel.getAccessList(taskId);
    return { ...task, accessList };
  },

  /**
   * Update a task (admin only — enforced at middleware level).
   */
  async updateTask(taskId: number, data: Partial<TaskInput>): Promise<Task> {
    const task = await TaskModel.update(taskId, data);
    if (!task) {
      const err = new Error('Task-ul nu a fost găsit.') as AppError;
      err.statusCode = 404;
      throw err;
    }
    return task;
  },

  /**
   * Change task status (move between Kanban columns).
   */
  async changeStatus(taskId: number, status: string, userId: number): Promise<Task> {
    const hasAccess = await TaskModel.hasAccess(taskId, userId);
    if (!hasAccess) {
      const err = new Error('Nu ai acces la acest task.') as AppError;
      err.statusCode = 403;
      throw err;
    }

    const validStatuses = ['todo', 'in_progress', 'completed', 'overdue'];
    if (!validStatuses.includes(status)) {
      const err = new Error(`Status invalid. Statusuri valide: ${validStatuses.join(', ')}`) as AppError;
      err.statusCode = 422;
      throw err;
    }

    return TaskModel.updateStatus(taskId, status);
  },

  /**
   * Delete a task (admin only — enforced at middleware level).
   */
  async deleteTask(taskId: number): Promise<boolean> {
    const deleted = await TaskModel.delete(taskId);
    if (!deleted) {
      const err = new Error('Task-ul nu a fost găsit.') as AppError;
      err.statusCode = 404;
      throw err;
    }
    return true;
  },

  /**
   * Get tasks near deadline (< 1 hour).
   */
  async getDeadlineZone(): Promise<Task[]> {
    return TaskModel.findDeadlineZone();
  },

  /**
   * Get tasks for calendar within a date range.
   */
  async getCalendarTasks(userId: number, startDate: string, endDate: string): Promise<Task[]> {
    return TaskModel.findForCalendar(userId, startDate, endDate);
  },

  /**
   * Grant a user access to a task.
   */
  async grantAccess(taskId: number, userId: number): Promise<TaskAccess> {
    return TaskModel.grantAccess(taskId, userId);
  },

  /**
   * Revoke access from a user.
   */
  async revokeAccess(taskId: number, userId: number): Promise<boolean> {
    const revoked = await TaskModel.revokeAccess(taskId, userId);
    if (!revoked) {
      const err = new Error('Utilizatorul nu avea acces la acest task.') as AppError;
      err.statusCode = 404;
      throw err;
    }
    return true;
  },
};

export default TaskService;
