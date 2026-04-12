import { getFudoToken, getFudoTokenCacheStatus } from '../services/fudoAuthService.js';
import {
  filterCategoriesByIds,
  getFudoCategories,
} from '../services/fudoCategoriesService.js';
import {
  getFudoProductsCatalog,
  getFudoProductsRaw,
} from '../services/fudoProductsService.js';
import { createItem } from '../services/fudoItemsService.js';
import { createOrder } from '../services/fudoOrdersService.js';
import { createSale } from '../services/fudoSalesService.js';

function groupProductsByCategoryId(products) {
  return products.reduce((groups, product) => {
    if (!product.categoryId) {
      return groups;
    }

    if (!groups[product.categoryId]) {
      groups[product.categoryId] = [];
    }

    groups[product.categoryId].push(product);
    return groups;
  }, {});
}

export async function getFudoHealth(_req, res, next) {
  try {
    await getFudoToken();

    const tokenStatus = getFudoTokenCacheStatus();

    res.status(200).json({
      status: 'OK',
      service: 'fudo',
      authenticated: true,
      token: {
        cached: tokenStatus.hasCachedToken,
        valid: tokenStatus.isTokenValid,
        expiresAt: tokenStatus.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getFudoProducts(_req, res, next) {
  try {
    const catalog = await getFudoProductsCatalog();
    res.status(200).json(catalog);
  } catch (error) {
    next(error);
  }
}

export async function getFudoProductsDebug(_req, res, next) {
  try {
    const payload = await getFudoProductsRaw();
    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
}

export async function getFudoCategoriesList(_req, res, next) {
  try {
    const categories = await getFudoCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
}

export async function getFudoCatalog(_req, res, next) {
  try {
    const [productsCatalog, categoriesCatalog] = await Promise.all([
      getFudoProductsCatalog(),
      getFudoCategories(),
    ]);

    const usedCategoryIds = productsCatalog.products.map((product) => product.categoryId);
    const categories = filterCategoriesByIds(categoriesCatalog.categories, usedCategoryIds);

    res.status(200).json({
      categories,
      products: productsCatalog.products,
      productsByCategory: groupProductsByCategoryId(productsCatalog.products),
    });
  } catch (error) {
    next(error);
  }
}

export async function createFudoSale(req, res, next) {
  try {
    const sale = await createSale(req.body);
    res.status(201).json(sale);
  } catch (error) {
    next(error);
  }
}

export async function createFudoItem(req, res, next) {
  try {
    const item = await createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function createFudoOrder(req, res, next) {
  try {
    const order = await createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}
