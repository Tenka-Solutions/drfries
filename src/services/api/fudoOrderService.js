import { requestFudoApi } from './fudoApiService.js';

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export function buildCreateOrderPayload({ customer, items, comment }) {
  const customerName = normalizeString(customer?.name);
  const customerPhone = normalizeString(customer?.phone);
  const orderComment = normalizeString(comment);

  if (!customerName) {
    throw createValidationError('El nombre del cliente es obligatorio.');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw createValidationError('Debes agregar al menos un producto al carrito.');
  }

  const normalizedItems = items.map((item, index) => {
    const productId = normalizeString(item?.productId);
    const quantity = Number(item?.quantity);
    const price = Number(item?.price);

    if (!productId || !/^\d{1,10}$/.test(productId)) {
      throw createValidationError(`El producto ${index + 1} no tiene un productId válido para Fudo.`);
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw createValidationError(`La cantidad del producto ${index + 1} debe ser mayor a 0.`);
    }

    if (!Number.isFinite(price) || price < 0) {
      throw createValidationError(`El precio del producto ${index + 1} no es válido.`);
    }

    return {
      productId,
      quantity,
      price,
    };
  });

  return {
    customer: {
      name: customerName,
      ...(customerPhone ? { phone: customerPhone } : {}),
    },
    items: normalizedItems,
    ...(orderComment ? { comment: orderComment } : {}),
  };
}

export async function createFudoOrder(orderData) {
  const payload = buildCreateOrderPayload(orderData);

  return requestFudoApi('create-order', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
