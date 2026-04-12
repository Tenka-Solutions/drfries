import { useEffect, useState } from 'react';
import { getFudoCatalog } from '../services/api/fudoCatalogService.js';

export function useFudoCatalog() {
  const [catalog, setCatalog] = useState({
    categories: [],
    products: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      try {
        setLoading(true);
        setError(null);

        const nextCatalog = await getFudoCatalog({
          signal: controller.signal,
        });

        setCatalog(nextCatalog);
      } catch (loadError) {
        if (loadError.name === 'AbortError') {
          return;
        }

        setError(loadError);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();

    return () => controller.abort();
  }, [reloadKey]);

  function reload() {
    setReloadKey((currentKey) => currentKey + 1);
  }

  return {
    categories: catalog.categories,
    products: catalog.products,
    loading,
    error,
    reload,
  };
}
