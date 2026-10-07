import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

/** Origin of the API host (for /uploads when front and API are on different domains). */
export function apiOrigin(): string | null {
  if (!API_URL.startsWith('http')) return null;
  try {
    return new URL(API_URL).origin;
  } catch {
    return null;
  }
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Session cookies are server-managed; 401 means login again.
    return Promise.reject(error);
  },
);

export function assetUrl(path?: string | null) {
  if (!path) return '/logo.png';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) {
    const origin = apiOrigin();
    return origin ? `${origin}${path}` : path;
  }
  return path;
}

/** Same pixel size for every image in a slot, so the browser fetches them in parallel. */
export type ImageSlot = 320 | 640 | 1280;

export function imageUrl(path: string | null | undefined, width: ImageSlot) {
  const url = assetUrl(path);
  if (!url.includes('/storage/v1/object/public/product-images/')) return url;
  const base = API_URL.replace(/\/$/, '');
  return `${base}/media?src=${encodeURIComponent(url)}&w=${width}`;
}

export function formatMoney(value: number | string) {
  const n = Number(value);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}
