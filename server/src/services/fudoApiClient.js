import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { clearFudoTokenCache, getFudoToken } from './fudoAuthService.js';

const FUDO_API_TIMEOUT_MS = 15_000;

function appendQueryParams(url, params = {}) {
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        url.searchParams.append(key, String(entry));
      });
      return;
    }

    url.searchParams.set(key, String(value));
  });
}

function buildUrl(path, params) {
  const normalizedPath = path.replace(/^\/+/, '');
  const url = new URL(normalizedPath, `${env.fudoApiBaseUrl}/`);
  appendQueryParams(url, params);
  return url.toString();
}

function isSerializableJsonBody(body) {
  return Boolean(body)
    && typeof body === 'object'
    && !(body instanceof ArrayBuffer)
    && !(body instanceof FormData)
    && !(body instanceof URLSearchParams)
    && !Buffer.isBuffer(body);
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

function createApiError(message, statusCode, details) {
  const error = new Error(message);
  error.statusCode = statusCode;

  if (details) {
    error.details = details;
  }

  return error;
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
      throw createApiError('Fudo API request timed out', 504, {
        url,
        timeoutMs,
      });
    }

    throw createApiError('Unable to reach Fudo API', 502, {
      url,
      cause: error.message,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function request(path, options = {}, attempt = 0) {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(path, params);
  const token = await getFudoToken();
  const headers = new Headers(fetchOptions.headers || {});
  let body = fetchOptions.body;

  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);

  if (body !== undefined && isSerializableJsonBody(body)) {
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
    body = JSON.stringify(body);
  }

  const response = await fetchWithTimeout(
    url,
    {
      ...fetchOptions,
      headers,
      body,
    },
    FUDO_API_TIMEOUT_MS,
  );

  const payload = await parseResponse(response);

  if (response.status === 401 && attempt === 0) {
    logger.warn('Fudo API rejected the cached token, retrying once', {
      url,
    });

    clearFudoTokenCache();
    return request(path, options, attempt + 1);
  }

  if (!response.ok) {
    throw createApiError(
      payload?.message || `Fudo API request failed with status ${response.status}`,
      response.status >= 500 ? 502 : response.status,
      payload,
    );
  }

  return payload;
}

export const fudoApiClient = {
  request,
  get(path, options = {}) {
    return request(path, { ...options, method: 'GET' });
  },
  post(path, body, options = {}) {
    return request(path, { ...options, method: 'POST', body });
  },
  put(path, body, options = {}) {
    return request(path, { ...options, method: 'PUT', body });
  },
  patch(path, body, options = {}) {
    return request(path, { ...options, method: 'PATCH', body });
  },
  delete(path, options = {}) {
    return request(path, { ...options, method: 'DELETE' });
  },
};
