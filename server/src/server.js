import app from './app.js';
import {
  env,
  getEnvironmentWarnings,
  getEnvStatusSummary,
  getMissingFudoEnvVars,
} from './config/env.js';
import { logger } from './config/logger.js';

let server = null;

export function startServer() {
  if (server) {
    return server;
  }

  server = app.listen(env.port, () => {
    logger.info('Server listening', {
      ...getEnvStatusSummary(),
      startupFile: 'server/src/server.js',
      allowedClientOrigins: env.allowedClientOrigins,
    });

    const missingEnvVars = getMissingFudoEnvVars();

    if (missingEnvVars.length > 0) {
      logger.warn('Fudo credentials are not configured yet', {
        missingEnvVars,
      });
    }

    const environmentWarnings = getEnvironmentWarnings();

    if (environmentWarnings.length > 0) {
      logger.warn('Environment configuration warnings detected', {
        warnings: environmentWarnings,
      });
    }
  });

  server.on('error', (error) => {
    logger.error('Server failed to start', {
      message: error.message,
    });

    process.exit(1);
  });

  return server;
}

function shutdown(signal) {
  if (!server) {
    process.exit(0);
    return;
  }

  logger.info('Shutting down server', { signal });
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    message: error.message,
    stack: error.stack,
  });
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});

startServer();
