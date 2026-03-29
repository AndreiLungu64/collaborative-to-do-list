/**
 * @module app
 * @description Express application entry point.
 * Configures middleware, routes, error handling, and starts the server.
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PORT, NODE_ENV } = require('./config/env');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const startDeadlineCron = require('./utils/deadlineCron');
const AuthController = require('./controllers/auth.controller');
const auth = require('./middleware/auth');

// Routes
const authRoutes = require('./routes/auth.routes');
const tasksRoutes = require('./routes/tasks.routes');

const app = express();

// ─── Middleware ───
app.use(cors({
  origin: NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : true,
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ─── Health Check ───
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'taskflow-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

// GET /api/users — list all users (for assignee picker)
app.get('/api/users', auth, AuthController.listUsers);

// ─── 404 Handler ───
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint-ul nu a fost găsit.' });
});

// ─── Error Handler ───
app.use(errorHandler);

// ─── Start Server — bind to 0.0.0.0 for network access ───
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 TaskFlow API pornit pe 0.0.0.0:${PORT} (${NODE_ENV})`);
  startDeadlineCron();
});

module.exports = app;
