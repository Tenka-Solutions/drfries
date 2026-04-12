import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'ERROR',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(error, req, res, _next) {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;

  logger.error('Request failed', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: error.message,
  });

  const payload = {
    status: 'ERROR',
    message: error.message || 'Unexpected server error',
  };

  if (env.nodeEnv !== 'production' && error.details) {
    payload.details = error.details;
  }

  res.status(statusCode).json(payload);
}
