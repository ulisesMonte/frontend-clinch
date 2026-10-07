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

/** Kept so call sites can name the slot. Photos are served from storage, not resized by the API. */
export type ImageSlot = 320 | 640 | 1280;

export function imageUrl(path: string | null | undefined, _width?: ImageSlot) {
  return assetUrl(path);
}

export function formatMoney(value: number | string) {
  const n = Number(value);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
}
