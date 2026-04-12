function serializeMeta(meta = {}) {
  return Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
}

function write(level, message, meta = {}) {
  const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  console[method](`[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${serializeMeta(meta)}`);
}

export const logger = {
  info(message, meta) {
    write('info', message, meta);
  },
  warn(message, meta) {
    write('warn', message, meta);
  },
  error(message, meta) {
    write('error', message, meta);
  },
};
