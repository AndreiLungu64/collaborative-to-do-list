/**
 * @module middleware/errorHandler
 * @description Centralized error handling middleware.
 * Catches all errors and sends a consistent JSON response.
 * Hides stack traces in production.
 */
const logger = require('../utils/logger');
const { NODE_ENV } = require('../config/env');

const errorHandler = (err, req, res, _next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const response = {
    error: err.message || 'Eroare internă a serverului.',
  };

  // Only show stack traces in development
  if (NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
