import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PORT = 5000;

function parsePort(value) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePort(process.env.PORT),
  fudoApiKey: process.env.FUDO_API_KEY || '',
  fudoApiSecret: process.env.FUDO_API_SECRET || '',
  fudoAuthUrl: 'https://auth.fu.do/api',
  fudoApiBaseUrl: 'https://api.fu.do/v1alpha1',
};

export function getMissingFudoEnvVars() {
  return ['FUDO_API_KEY', 'FUDO_API_SECRET'].filter((name) => !process.env[name]);
}

export function hasFudoCredentials() {
  return getMissingFudoEnvVars().length === 0;
}
