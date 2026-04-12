import app from './app.js';
import { env, getMissingFudoEnvVars } from './config/env.js';
import { logger } from './config/logger.js';

const server = app.listen(env.port, () => {
  logger.info('Server listening', {
    port: env.port,
    nodeEnv: env.nodeEnv,
  });

  const missingEnvVars = getMissingFudoEnvVars();

  if (missingEnvVars.length > 0) {
    logger.warn('Fudo credentials are not configured yet', {
      missingEnvVars,
    });
  }
});

server.on('error', (error) => {
  logger.error('Server failed to start', {
    message: error.message,
  });

  process.exit(1);
});

function shutdown(signal) {
  logger.info('Shutting down server', { signal });
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
