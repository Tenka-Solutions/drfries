import express from 'express';
import { corsMiddleware } from './config/cors.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import fudoRoutes from './routes/fudoRoutes.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    logger.info('HTTP request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
});

function getHealthPayload() {
  return {
    status: 'OK',
    service: 'drfries-server',
    environment: env.nodeEnv,
  };
}

app.get('/health', (_req, res) => {
  res.status(200).json(getHealthPayload());
});

app.get('/api/health', (_req, res) => {
  res.status(200).json(getHealthPayload());
});

app.use('/api/fudo', fudoRoutes);

// Keep compatibility with the current Vite proxy, which strips /api in dev.
app.use('/fudo', fudoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
