import { api } from './api';
import { queryClient } from './queryClient';
import type { Category, Product } from './types';

export type StorefrontBootstrap = {
  featured: Product[];
  products: {
    items: Product[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  categories: Category[];
};

const STORAGE_KEY = 'clinch:storefront:v3';
export const STOREFRONT_STALE_MS = 2 * 60_000;
export const storefrontQueryKey = ['storefront'] as const;
export const featuredQueryKey = ['products', 'featured'] as const;

type StoredBootstrap = {
  data: StorefrontBootstrap;
  savedAt: number;
};

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function readStorefrontCache(): StoredBootstrap | null {
  try {
    const raw = storageGet(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredBootstrap;
    if (!parsed?.data?.featured || !parsed?.data?.products) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStorefrontCache(data: StorefrontBootstrap) {
  try {
    const payload: StoredBootstrap = { data, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    sessionStorage.removeItem('clinch:storefront');
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearStorefrontCache() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('clinch:storefront');
  } catch {
    /* ignore */
  }
  queryClient.removeQueries({ queryKey: storefrontQueryKey });
}

export function findStorefrontProduct(slug: string | undefined): Product | undefined {
  if (!slug) return undefined;
  const data =
    queryClient.getQueryData<StorefrontBootstrap>(storefrontQueryKey) ??
    readStorefrontCache()?.data;
  if (!data) return undefined;
  return (
    data.products.items.find((product) => product.slug === slug) ??
    data.featured.find((product) => product.slug === slug)
  );
}

export async function fetchStorefrontBootstrap(): Promise<StorefrontBootstrap> {
  const { data } = await api.get<StorefrontBootstrap>('/storefront/bootstrap');
  writeStorefrontCache(data);
  queryClient.setQueryData(['products', '', ''], data.products);
  queryClient.setQueryData(featuredQueryKey, data.featured);
  queryClient.setQueryData(['categories'], data.categories);
  return data;
}

export function hydrateStorefrontFromSession() {
  const cached = readStorefrontCache();
  if (!cached) return;
  queryClient.setQueryData(storefrontQueryKey, cached.data);
  queryClient.setQueryData(['products', '', ''], cached.data.products);
  queryClient.setQueryData(featuredQueryKey, cached.data.featured);
  queryClient.setQueryData(['categories'], cached.data.categories);
}

export function storefrontQueryOptions() {
  const cached = readStorefrontCache();
  return {
    queryKey: storefrontQueryKey,
    queryFn: fetchStorefrontBootstrap,
    staleTime: STOREFRONT_STALE_MS,
    gcTime: 30 * 60_000,
    ...(cached
      ? {
          initialData: cached.data,
          initialDataUpdatedAt: cached.savedAt,
        }
      : {}),
  };
}

/** Call after admin mutates catalog so home/catalog refresh soon. */
export function invalidateStorefront() {
  clearStorefrontCache();
  void queryClient.invalidateQueries({ queryKey: storefrontQueryKey });
  void queryClient.invalidateQueries({ queryKey: featuredQueryKey });
  void queryClient.invalidateQueries({ queryKey: ['products'] });
  void queryClient.invalidateQueries({ queryKey: ['categories'] });
  void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  void queryClient.invalidateQueries({ queryKey: ['admin-bootstrap'] });
}
