import cors from 'cors';
import { env } from './env.js';
import { logger } from './logger.js';

function createCorsError(origin) {
  const error = new Error(`CORS origin not allowed: ${origin}`);
  error.statusCode = 403;
  return error;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createOriginMatcher(allowedOrigin) {
  if (!allowedOrigin.includes('*')) {
    return (origin) => origin === allowedOrigin;
  }

  const pattern = `^${allowedOrigin
    .split('*')
    .map(escapeRegExp)
    .join('.*')}$`;
  const regex = new RegExp(pattern);

  return (origin) => regex.test(origin);
}

const originMatchers = env.allowedClientOrigins.map((origin) => ({
  origin,
  matches: createOriginMatcher(origin),
}));

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  return originMatchers.some((matcher) => matcher.matches(origin));
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
