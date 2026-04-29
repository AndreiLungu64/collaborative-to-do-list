/**
 * @module app
 * @description Express application entry point.
 * Configures middleware, routes, error handling, and starts the server.
 */
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PORT, NODE_ENV } from './config/env';
import logger from './utils/logger';
import errorHandler from './middleware/errorHandler';
import startDeadlineCron from './utils/deadlineCron';
import AuthController from './controllers/auth.controller';
import auth from './middleware/auth';

// Routes
import authRoutes from './routes/auth.routes';
import tasksRoutes from './routes/tasks.routes';

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
  stream: { write: (msg: string) => logger.info(msg.trim()) },
}));

// ─── Health Check ───
app.get('/api/health', (_req: Request, res: Response) => {
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
app.get('/api/users', auth as any, AuthController.listUsers);

// ─── 404 Handler ───
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint-ul nu a fost găsit.' });
});

// ─── Error Handler ───
app.use(errorHandler);

// ─── Start Server — bind to 0.0.0.0 for network access ───
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 TaskFlow API pornit pe 0.0.0.0:${PORT} (${NODE_ENV})`);
  startDeadlineCron();
});

export default app;
