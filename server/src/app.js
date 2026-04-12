import cors from 'cors';
import express from 'express';
import { logger } from './config/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import fudoRoutes from './routes/fudoRoutes.js';

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

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

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'drfries-server',
  });
});

app.use('/api/fudo', fudoRoutes);

// Keep compatibility with the current Vite proxy, which strips /api in dev.
app.use('/fudo', fudoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
