/**
 * @module middleware/errorHandler
 * @description Centralized error handling middleware.
 * Catches all errors and sends a consistent JSON response.
 * Hides stack traces in production.
 */
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { NODE_ENV } from '../config/env';
import { AppError } from '../types';

const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction): void => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const response: Record<string, unknown> = {
    error: err.message || 'Eroare internă a serverului.',
  };

  // Only show stack traces in development
  if (NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
