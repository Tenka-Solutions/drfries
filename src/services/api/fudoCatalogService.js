const DEV_API_BASES = [
  'http://localhost:5000/api/fudo',
  '/api/fudo',
];

const PROD_API_BASES = [
  '/api/fudo',
];

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

async function requestJsonFromCandidates(path, signal) {
  const errors = [];

  for (const baseUrl of getApiBases()) {
    try {
      const response = await fetch(`${baseUrl}/${path}`, {
        headers: {
          Accept: 'application/json',
        },
        signal,
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
    const catalog = await requestJsonFromCandidates('catalog', signal);

    if (Array.isArray(catalog?.products)) {
      return normalizeCatalog(catalog);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
  }

  const [productsPayload, categoriesPayload] = await Promise.all([
    requestJsonFromCandidates('products', signal),
    requestJsonFromCandidates('categories', signal),
  ]);

  return normalizeCatalog({
    products: productsPayload?.products || [],
    categories: categoriesPayload?.categories || [],
  });
}
