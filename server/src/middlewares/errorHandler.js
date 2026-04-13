import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

function getStatusCode(error) {
  if (Number.isInteger(error?.statusCode) && error.statusCode >= 400) {
    return error.statusCode;
  }

  if (error?.name === 'AbortError') {
    return 504;
  }

  return 500;
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'ERROR',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(error, req, res, _next) {
  const statusCode = getStatusCode(error);

  logger.error('Request failed', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: error?.message,
    details: error?.details,
  });

  const payload = {
    status: 'ERROR',
    message: error?.message || 'Unexpected server error',
    timestamp: new Date().toISOString(),
  };

  if (env.nodeEnv !== 'production' && error?.details) {
    payload.details = error.details;
  }

  res.status(statusCode).json(payload);
}
