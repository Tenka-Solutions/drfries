const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

const DEV_API_BASES = [
  configuredApiBaseUrl,
  'http://localhost:3001/api/fudo',
  'http://localhost:5000/api/fudo',
  '/api/fudo',
].filter(Boolean);

const PROD_API_BASES = [
  configuredApiBaseUrl,
  '/api/fudo',
].filter(Boolean);

function getApiBases() {
  return import.meta.env.DEV ? DEV_API_BASES : PROD_API_BASES;
}

async function parseJsonResponse(response) {
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

function createRequestError(message, statusCode, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

export async function requestFudoApi(path, options = {}) {
  const errors = [];

  for (const baseUrl of getApiBases()) {
    try {
      const response = await fetch(`${baseUrl}/${path}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...(options.headers || {}),
        },
      });

      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        throw createRequestError(
          payload?.message || `Request failed with status ${response.status}`,
          response.status,
          payload,
        );
      }

      return payload;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }

      errors.push(error);
    }
  }

  const lastError = errors.at(-1);

  if (lastError) {
    throw lastError;
  }

  throw new Error(`Unable to fetch ${path}`);
}
