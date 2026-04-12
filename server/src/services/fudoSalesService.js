import { logger } from '../config/logger.js';
import { fudoApiClient } from './fudoApiClient.js';

const FUDO_SALE_TYPE_TAKEAWAY = 'TAKEAWAY';
const MAX_CUSTOMER_NAME_LENGTH = 90;
const MAX_COMMENT_LENGTH = 255;

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateCreateSaleInput(payload = {}) {
  const customerName = normalizeString(payload.customerName);
  const comment = normalizeString(payload.comment);

  if (!customerName) {
    throw createValidationError('customerName is required');
  }

  if (customerName.length > MAX_CUSTOMER_NAME_LENGTH) {
    throw createValidationError(`customerName must be ${MAX_CUSTOMER_NAME_LENGTH} characters or fewer`);
  }

  if (payload.comment !== undefined && typeof payload.comment !== 'string') {
    throw createValidationError('comment must be a string');
  }

  if (comment.length > MAX_COMMENT_LENGTH) {
    throw createValidationError(`comment must be ${MAX_COMMENT_LENGTH} characters or fewer`);
  }

  return {
    customerName,
    comment,
  };
}

export function buildCreateSalePayload(payload = {}) {
  const { customerName, comment } = validateCreateSaleInput(payload);

  const attributes = {
    saleType: FUDO_SALE_TYPE_TAKEAWAY,
    customerName,
  };

  if (comment) {
    attributes.comment = comment;
  }

  return {
    data: {
      type: 'Sale',
      attributes,
    },
  };
}

export async function createSale(payload = {}) {
  const fudoPayload = buildCreateSalePayload(payload);
  const raw = await fudoApiClient.post('/sales', fudoPayload);
  const saleId = raw?.data?.id || null;

  logger.info('Fudo sale created', {
    saleId,
    saleType: FUDO_SALE_TYPE_TAKEAWAY,
  });

  return {
    saleId,
    raw,
  };
}
