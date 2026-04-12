import { requestFudoApi } from './fudoApiService.js';

function mapCategories(categories = []) {
  return categories
    .map((category) => ({
      id: category?.id || '',
      name: category?.name || '',
    }))
    .filter((category) => category.id && category.name);
}

function mapProducts(products = [], categoryMap) {
  return products.map((product) => {
    const categoryName = categoryMap.get(product.categoryId) || 'Sin categoría';

    return {
      id: product.id,
      productId: String(product.id),
      name: product.name || 'Producto sin nombre',
      title: product.name || 'Producto sin nombre',
      description: product.description || 'Sin descripción disponible.',
      price: Number(product.price) || 0,
      categoryId: product.categoryId || null,
      category: categoryName,
      imageUrl: product.imageUrl || null,
      img: product.imageUrl || null,
      available: product.available !== false,
      stock: product.stock ?? null,
      stockControl: Boolean(product.stockControl),
      sellAlone: Boolean(product.sellAlone),
      isFudoProduct: true,
    };
  });
}

function normalizeCatalog({ categories = [], products = [] }) {
  const normalizedCategories = mapCategories(categories);
  const categoryMap = new Map(normalizedCategories.map((category) => [category.id, category.name]));

  return {
    categories: normalizedCategories,
    products: mapProducts(products, categoryMap),
  };
}

export async function getFudoCatalog({ signal } = {}) {
  try {
    const catalog = await requestFudoApi('catalog', { signal });

    if (Array.isArray(catalog?.products)) {
      return normalizeCatalog(catalog);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
  }

  const [productsPayload, categoriesPayload] = await Promise.all([
    requestFudoApi('products', { signal }),
    requestFudoApi('categories', { signal }),
  ]);

  return normalizeCatalog({
    products: productsPayload?.products || [],
    categories: categoriesPayload?.categories || [],
  });
}
