import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PORT = 5000;
const DEFAULT_NODE_ENV = 'development';
const DEFAULT_CLIENT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const DEFAULT_FUDO_AUTH_URL = 'https://auth.fu.do/api';
const DEFAULT_FUDO_API_BASE_URL = 'https://api.fu.do/v1alpha1';

function parsePort(value) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
}

function normalizeNodeEnv(value) {
  return value === 'production' ? 'production' : DEFAULT_NODE_ENV;
}

function parseList(value) {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeUrl(value, fallback) {
  const nextValue = typeof value === 'string' && value.trim() ? value.trim() : fallback;

  try {
    return new URL(nextValue).toString().replace(/\/$/, '');
  } catch {
    return fallback.replace(/\/$/, '');
  }
}

const nodeEnv = normalizeNodeEnv(process.env.NODE_ENV);
const configuredClientOrigins = parseList(process.env.CLIENT_ORIGIN);
const allowedClientOrigins = nodeEnv === 'production'
  ? configuredClientOrigins
  : [...new Set([...DEFAULT_CLIENT_ORIGINS, ...configuredClientOrigins])];

export const env = {
  nodeEnv,
  isDevelopment: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',
  port: parsePort(process.env.PORT),
  clientOrigin: process.env.CLIENT_ORIGIN || '',
  allowedClientOrigins,
  fudoApiKey: process.env.FUDO_API_KEY || '',
  fudoApiSecret: process.env.FUDO_API_SECRET || '',
  fudoAuthUrl: normalizeUrl(process.env.FUDO_AUTH_URL, DEFAULT_FUDO_AUTH_URL),
  fudoApiBaseUrl: normalizeUrl(process.env.FUDO_API_BASE_URL, DEFAULT_FUDO_API_BASE_URL),
};

export function getMissingFudoEnvVars() {
  return ['FUDO_API_KEY', 'FUDO_API_SECRET'].filter((name) => !process.env[name]);
}

export function hasFudoCredentials() {
  return getMissingFudoEnvVars().length === 0;
}

export function getEnvironmentWarnings() {
  const warnings = [];

  if (env.isProduction && !env.clientOrigin.trim()) {
    warnings.push('CLIENT_ORIGIN is not configured for production');
  }

  return warnings;
}
