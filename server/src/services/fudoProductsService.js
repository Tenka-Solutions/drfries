import { logger } from '../config/logger.js';
import { fudoApiClient } from './fudoApiClient.js';

const PRODUCTS_QUERY = Object.freeze({
  'filter[active]': true,
  include: 'productCategory',
  'page[size]': 100,
  sort: 'name',
});

function toBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return Boolean(value);
}

function toNumber(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function getCategoryId(product) {
  return product?.relationships?.productCategory?.data?.id || null;
}

function isAvailableProduct(productAttributes) {
  const active = toBoolean(productAttributes.active);
  const stockControl = toBoolean(productAttributes.stockControl);
  const stock = toNumber(productAttributes.stock);

  if (!active) {
    return false;
  }

  if (stockControl) {
    return stock !== null && stock > 0;
  }

  return true;
}

function mapProduct(product) {
  const attributes = product?.attributes || {};

  return {
    id: product?.id || null,
    name: attributes.name || '',
    description: attributes.description || '',
    price: toNumber(attributes.price),
    imageUrl: attributes.imageUrl || null,
    categoryId: getCategoryId(product),
    available: isAvailableProduct(attributes),
    stock: toNumber(attributes.stock),
    stockControl: toBoolean(attributes.stockControl),
    sellAlone: toBoolean(attributes.sellAlone),
  };
}

function isWebProduct(product) {
  return toBoolean(product?.attributes?.active) && toBoolean(product?.attributes?.sellAlone);
}

function normalizeProductsResponse(response, options = {}) {
  const products = Array.isArray(response?.data) ? response.data : [];
  const normalizedPayload = {
    products: products
      .filter(isWebProduct)
      .map(mapProduct),
  };

  if (options.includeRaw) {
    normalizedPayload.raw = response;
  }

  return normalizedPayload;
}

export async function getFudoProductsRaw() {
  const response = await fudoApiClient.get('/products', {
    params: PRODUCTS_QUERY,
  });

  logger.info('Fudo products fetched', {
    productCount: Array.isArray(response?.data) ? response.data.length : 0,
  });

  return response;
}

export async function getFudoProductsCatalog(options = {}) {
  const response = options.rawResponse || await getFudoProductsRaw();
  return normalizeProductsResponse(response, options);
}
