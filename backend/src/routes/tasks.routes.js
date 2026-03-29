/**
 * @module routes/tasks.routes
 * @description Task routes with middleware chains for auth and admin checks.
 */
const { Router } = require('express');
const { body } = require('express-validator');
const TasksController = require('../controllers/tasks.controller');
const auth = require('../middleware/auth');
const isTaskAdmin = require('../middleware/isTaskAdmin');

const router = Router();

// All routes require authentication
router.use(auth);

// Special routes MUST come before /:id to avoid route conflicts
router.get('/deadline', TasksController.deadlineZone);
router.get('/calendar', TasksController.calendar);

// GET /api/tasks — List visible tasks
router.get('/', TasksController.list);

// POST /api/tasks — Create task
router.post(
  '/',
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Titlul este obligatoriu (max 100 caractere).'),
    body('deadline')
      .isISO8601()
      .withMessage('Deadline-ul trebuie să fie o dată validă.'),
    body('visibility')
      .optional()
      .isIn(['personal', 'public'])
      .withMessage('Vizibilitatea trebuie să fie "personal" sau "public".'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Prioritatea trebuie să fie: low, medium, high, critical.'),
  ],
  TasksController.create
);

// GET /api/tasks/:id — Task details
router.get('/:id', TasksController.getById);

// PUT /api/tasks/:id — Edit task (admin only)
router.put('/:id', isTaskAdmin, TasksController.update);

// DELETE /api/tasks/:id — Delete task (admin only)
router.delete('/:id', isTaskAdmin, TasksController.remove);

// PATCH /api/tasks/:id/status — Change status
router.patch('/:id/status', TasksController.changeStatus);

// POST /api/tasks/:id/access — Grant access (admin only)
router.post('/:id/access', isTaskAdmin, TasksController.grantAccess);

// DELETE /api/tasks/:id/access/:userId — Revoke access (admin only)
router.delete('/:id/access/:userId', isTaskAdmin, TasksController.revokeAccess);

module.exports = router;
