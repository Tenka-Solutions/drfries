import { logger } from '../config/logger.js';
import { createItem, validateItemLineInput } from './fudoItemsService.js';
import { createSale, validateCreateSaleInput } from './fudoSalesService.js';

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizePhone(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateCreateOrderInput(payload = {}) {
  const customer = payload?.customer;

  if (!customer || typeof customer !== 'object' || Array.isArray(customer)) {
    throw createValidationError('customer is required');
  }

  const saleInput = validateCreateSaleInput({
    customerName: customer.name,
    comment: payload.comment,
  });

  const phone = normalizePhone(customer.phone);

  if (customer.phone !== undefined && typeof customer.phone !== 'string') {
    throw createValidationError('customer.phone must be a string');
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw createValidationError('items must be a non-empty array');
  }

  const items = payload.items.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw createValidationError(`items[${index}] must be an object`);
    }

    try {
      return validateItemLineInput(item);
    } catch (error) {
      error.message = `items[${index}]: ${error.message}`;
      throw error;
    }
  });

  return {
    customer: {
      name: saleInput.customerName,
      ...(phone ? { phone } : {}),
    },
    comment: saleInput.comment,
    items,
  };
}

function buildOrderFailureError({
  cause,
  sale,
  createdItems,
  failedItem,
  failedItemIndex,
}) {
  const error = new Error('Order creation failed after the sale was created in Fudo');
  error.statusCode = Number.isInteger(cause.statusCode) ? cause.statusCode : 502;
  error.details = {
    saleId: sale.saleId,
    createdItems,
    failedItemIndex,
    failedItem,
    upstreamMessage: cause.message,
  };

  if (cause.details) {
    error.details.upstreamDetails = cause.details;
  }

  return error;
}

export async function createOrder(payload = {}) {
  const order = validateCreateOrderInput(payload);

  logger.info('Starting Fudo order orchestration', {
    customerName: order.customer.name,
    hasPhone: Boolean(order.customer.phone),
    itemCount: order.items.length,
  });

  const sale = await createSale({
    customerName: order.customer.name,
    comment: order.comment,
  });

  const createdItems = [];

  try {
    for (const [index, item] of order.items.entries()) {
      logger.info('Creating Fudo order item', {
        saleId: sale.saleId,
        index,
        productId: item.productId,
        quantity: item.quantity,
      });

      const createdItem = await createItem({
        saleId: sale.saleId,
        ...item,
      });

      createdItems.push({
        itemId: createdItem.itemId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }
  } catch (error) {
    const failedItemIndex = createdItems.length;
    const failedItem = order.items[failedItemIndex] || null;

    logger.error('Fudo order orchestration failed after sale creation', {
      saleId: sale.saleId,
      failedItemIndex,
      createdItemsCount: createdItems.length,
      upstreamMessage: error.message,
    });

    throw buildOrderFailureError({
      cause: error,
      sale,
      createdItems,
      failedItem,
      failedItemIndex,
    });
  }

  logger.info('Fudo order orchestration completed', {
    saleId: sale.saleId,
    itemCount: createdItems.length,
  });

  // Payment orchestration can be plugged here once the Fudo payment payload is defined.
  return {
    saleId: sale.saleId,
    items: createdItems,
    success: true,
  };
}
