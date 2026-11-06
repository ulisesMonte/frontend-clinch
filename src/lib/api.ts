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

/** 1280 is the file stored in the database. 320 and 640 live in the same folder. */
export type ImageSlot = 320 | 640 | 1280;

const STORAGE_PREFIX = '/storage/v1/object/public/product-images/';
const VARIANT_FILE = /\/(320|640|1280)\.webp$/;

function storagePhotoUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
    if (!parsed.pathname.startsWith(STORAGE_PREFIX)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Swap the size suffix when this photo was saved as 320/640/1280. */
function variantUrl(url: string, width: ImageSlot) {
  const [path, query] = url.split('?');
  if (!VARIANT_FILE.test(path)) return null;
  const target = width >= 1280 ? 1280 : width;
  const sized = path.replace(VARIANT_FILE, `/${target}.webp`);
  return query ? `${sized}?${query}` : sized;
}

/**
 * New photos point at the stored WebP of the right size.
 * Older photos still ask /api/media to resize on the way out.
 */
export function imageUrl(path: string | null | undefined, width?: ImageSlot) {
  const url = assetUrl(path);
  if (!path) return url;
  if (width) {
    const sized = variantUrl(url, width);
    if (sized) return sized;
  }
  if (!width || width >= 1280) return url;
  if (!storagePhotoUrl(url)) return url;

  const params = new URLSearchParams({ src: url, w: String(width) });
  return `${API_URL.replace(/\/$/, '')}/media?${params.toString()}`;
}

export function formatMoney(value: number | string) {
  const n = Number(value);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}
