import cors from 'cors';
import { env } from './env.js';
import { logger } from './logger.js';

function createCorsError(origin) {
  const error = new Error(`CORS origin not allowed: ${origin}`);
  error.statusCode = 403;
  return error;
}

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  return env.allowedClientOrigins.includes(origin);
}

export const corsMiddleware = cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    logger.warn('Blocked by CORS policy', {
      origin,
      allowedOrigins: env.allowedClientOrigins,
    });

    return callback(createCorsError(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
});
