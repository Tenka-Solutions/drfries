import { env, getMissingFudoEnvVars, hasFudoCredentials } from '../config/env.js';
import { logger } from '../config/logger.js';

const TOKEN_EXPIRY_BUFFER_MS = 30_000;
const FUDO_AUTH_TIMEOUT_MS = 10_000;

const tokenCache = {
  token: null,
  expiresAtMs: 0,
  refreshPromise: null,
};

function createServiceError(message, statusCode, details) {
  const error = new Error(message);
  error.statusCode = statusCode;

  if (details) {
    error.details = details;
  }

  return error;
}

function normalizeExpirationTimestamp(exp) {
  if (!Number.isFinite(exp)) {
    return 0;
  }

  return exp > 1_000_000_000_000 ? exp : exp * 1000;
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function hasValidToken() {
  return Boolean(tokenCache.token) && Date.now() < tokenCache.expiresAtMs - TOKEN_EXPIRY_BUFFER_MS;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createServiceError('Fudo auth request timed out', 504, {
        url,
        timeoutMs,
      });
    }

    throw createServiceError('Unable to reach Fudo auth service', 502, {
      url,
      cause: error.message,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestNewFudoToken() {
  if (!hasFudoCredentials()) {
    throw createServiceError(
      `Missing Fudo credentials: ${getMissingFudoEnvVars().join(', ')}`,
      503,
    );
  }

  logger.info('Requesting new Fudo auth token', {
    authUrl: env.fudoAuthUrl,
  });

  const response = await fetchWithTimeout(
    env.fudoAuthUrl,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: env.fudoApiKey,
        apiSecret: env.fudoApiSecret,
      }),
    },
    FUDO_AUTH_TIMEOUT_MS,
  );

  const payload = await parseResponse(response);

  if (!response.ok) {
    clearFudoTokenCache();

    logger.error('Fudo auth request failed', {
      statusCode: response.status,
      payload,
    });

    throw createServiceError(
      payload?.message || `Fudo auth request failed with status ${response.status}`,
      502,
      payload,
    );
  }

  if (!payload?.token || typeof payload.exp === 'undefined') {
    clearFudoTokenCache();

    throw createServiceError(
      'Fudo auth response did not include token and exp',
      502,
      payload,
    );
  }

  const expiresAtMs = normalizeExpirationTimestamp(Number(payload.exp));

  if (!expiresAtMs) {
    clearFudoTokenCache();

    throw createServiceError(
      'Fudo auth response contained an invalid exp value',
      502,
      payload,
    );
  }

  tokenCache.token = payload.token;
  tokenCache.expiresAtMs = expiresAtMs;

  logger.info('Fudo token stored successfully', {
    expiresAt: new Date(expiresAtMs).toISOString(),
  });

  return tokenCache.token;
}

export async function getFudoToken(options = {}) {
  const { forceRefresh = true } = options;

  if (!forceRefresh && hasValidToken()) {
    return tokenCache.token;
  }

  if (!tokenCache.refreshPromise) {
    tokenCache.refreshPromise = requestNewFudoToken().finally(() => {
      tokenCache.refreshPromise = null;
    });
  }

  return tokenCache.refreshPromise;
}

export function getFudoTokenCacheStatus() {
  return {
    hasCachedToken: Boolean(tokenCache.token),
    isTokenValid: hasValidToken(),
    expiresAt: tokenCache.expiresAtMs
      ? new Date(tokenCache.expiresAtMs).toISOString()
      : null,
  };
}

export function clearFudoTokenCache() {
  tokenCache.token = null;
  tokenCache.expiresAtMs = 0;
  tokenCache.refreshPromise = null;
}
