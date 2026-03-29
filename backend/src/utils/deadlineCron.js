/**
 * @module utils/deadlineCron
 * @description Cron job that runs every 5 minutes to:
 * 1. Mark overdue tasks (deadline passed + not completed)
 * 2. Log deadline zone activity
 */
const cron = require('node-cron');
const TaskModel = require('../models/task.model');
const logger = require('./logger');

/**
 * Start the deadline checker cron job.
 * Runs every 5 minutes: checks for overdue tasks and marks them.
 */
const startDeadlineCron = () => {
  // Every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const markedCount = await TaskModel.markOverdue();
      if (markedCount > 0) {
        logger.info(`[CRON] ${markedCount} task(uri) marcate ca overdue.`);
      }

      const deadlineZone = await TaskModel.findDeadlineZone();
      if (deadlineZone.length > 0) {
        logger.info(`[CRON] ${deadlineZone.length} task(uri) în deadline zone (< 1h).`);
      }
    } catch (err) {
      logger.error('[CRON] Eroare la verificarea deadline-urilor', { error: err.message });
    }
  });

  logger.info('[CRON] Deadline checker pornit — verifică la fiecare 5 minute.');
};

module.exports = startDeadlineCron;
