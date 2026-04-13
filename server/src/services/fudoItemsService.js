import { logger } from '../config/logger.js';
import { fudoApiClient } from './fudoApiClient.js';

const MAX_ID_LENGTH = 10000;

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizeId(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidFudoId(value) {
  return /^\d{1,10000}$/.test(value);
}

function normalizeNumber(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? NaN : parsedValue;
  }

  return NaN;
}

export function validateItemLineInput(payload = {}) {
  const productId = normalizeId(payload.productId);
  const quantity = normalizeNumber(payload.quantity);
  const price = normalizeNumber(payload.price);

  if (!productId) {
    throw createValidationError('productId is required');
  }

  if (!isValidFudoId(productId)) {
    throw createValidationError(`productId must be a numeric string up to ${MAX_ID_LENGTH} digits`);
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw createValidationError('quantity must be a number greater than 0');
  }

  if (!Number.isFinite(price) || price < 0) {
    throw createValidationError('price must be a number greater than or equal to 0');
  }

  return {
    productId,
    quantity,
    price,
  };
}

export function validateCreateItemInput(payload = {}) {
  const saleId = normalizeId(payload.saleId);
  const itemLine = validateItemLineInput(payload);

  if (!saleId) {
    throw createValidationError('saleId is required');
  }

  if (!isValidFudoId(saleId)) {
    throw createValidationError(`saleId must be a numeric string up to ${MAX_ID_LENGTH} digits`);
  }

  return {
    saleId,
    ...itemLine,
  };
}

export function buildCreateItemPayload(payload = {}) {
  const { saleId, productId, quantity, price } = validateCreateItemInput(payload);

  return {
    data: {
      type: 'Item',
      attributes: {
        quantity,
        price,
      },
      relationships: {
        product: {
          data: {
            id: productId,
            type: 'Product',
          },
        },
        sale: {
          data: {
            id: saleId,
            type: 'Sale',
          },
        },
      },
    },
  };
}

export async function createItem(payload = {}) {
  const fudoPayload = buildCreateItemPayload(payload);
  const raw = await fudoApiClient.post('/items', fudoPayload);
  const itemId = raw?.data?.id || null;

  logger.info('Fudo item created', {
    itemId,
    saleId: payload.saleId,
    productId: payload.productId,
  });

  return {
    itemId,
    raw,
  };
}
