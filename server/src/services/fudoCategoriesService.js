import { logger } from '../config/logger.js';
import { fudoApiClient } from './fudoApiClient.js';

function normalizeCategoryName(category) {
  const attributes = category?.attributes || {};

  return attributes.name
    || attributes.title
    || category?.name
    || '';
}

function mapCategory(category) {
  return {
    id: category?.id || null,
    name: normalizeCategoryName(category),
  };
}

function sortCategoriesByName(categories) {
  return [...categories].sort((left, right) => left.name.localeCompare(right.name, 'es', {
    sensitivity: 'base',
  }));
}

export async function getFudoCategoriesRaw() {
  const response = await fudoApiClient.get('/product-categories');

  logger.info('Fudo categories fetched', {
    categoryCount: Array.isArray(response?.data) ? response.data.length : 0,
  });

  return response;
}

export async function getFudoCategories() {
  const response = await getFudoCategoriesRaw();
  const categories = Array.isArray(response?.data) ? response.data : [];

  return {
    categories: categories.map(mapCategory),
  };
}

export function filterCategoriesByIds(categories, categoryIds) {
  const allowedIds = new Set(categoryIds.filter(Boolean));

  return categories.filter((category) => allowedIds.has(category.id));
}
