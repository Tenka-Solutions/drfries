import { env } from '../config/env.js';
import { getFudoToken } from './fudoAuthService.js';

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

async function request(path, options = {}) {
  const { params, ...fetchOptions } = options;
  const token = await getFudoToken();
  const headers = new Headers(fetchOptions.headers || {});
  let body = fetchOptions.body;

  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);

  if (body !== undefined && isSerializableJsonBody(body)) {
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
    body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, params), {
    ...fetchOptions,
    headers,
    body,
  });

  const payload = await parseResponse(response);

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
