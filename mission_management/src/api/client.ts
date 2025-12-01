/**
 * @fileoverview HTTP client configuration with Axios interceptors for authentication and error handling.
 *
 * This module exports a pre-configured Axios instance (`apiClient`) that:
 * - Attaches JWT bearer tokens to outgoing requests via an interceptor
 * - Handles 401 (Unauthorized) by clearing tokens
 * - Displays user-friendly 403 (Forbidden) toasts
 * - Supports both real backend and MSW (Mock Service Worker) in development
 *
 * @module api/client
 */

import axios from 'axios';
import { toast } from 'sonner';
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';
// When using MSW in dev, use same-origin relative base URL so the Service Worker can intercept.
// Otherwise, fall back to configured API URL (or sensible default).
const baseURL = useMock ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:5189/api/v1');

// Route translation layer: maps frontend English/plural resource paths to backend Spanish/singular controller names.
// Only applied when NOT using mock.
const routeMap: Record<string, string> = {
  '/missions': '/Mision',
  '/sorcerers': '/Hechicero',
  '/curses': '/Maldicion',
  '/resources': '/Recurso',
  '/support-staff': '/PersonalDeApoyo',
  '/locations': '/Ubicacion',
  '/transfers': '/Traslado',
  '/techniques': '/TecnicaMaldita',
  '/applied-techniques': '/TecnicaMalditaAplicada',
  '/dominated-techniques': '/TecnicaMalditaDominada',
  '/mastered-techniques': '/TecnicaMalditaDominada',
  '/requests': '/Solicitud',
  '/resource-usages': '/UsoDeRecurso',
  '/sorcerers-in-charge': '/HechiceroEncargado',
  '/audit': '/Audit', // si existe equivalente
};

/**
 * Translate an outgoing relative URL path based on the first segment.
 * Preserves query string and trailing segments (e.g. /missions/123 -> /Mision/123).
 */
function translatePath(url?: string): string | undefined {
  if (!url || useMock) return url; // Skip when mocking or no url.
  // Absolute URLs (http...) should not be remapped.
  if (/^https?:\/\//i.test(url)) return url;
  const [pathPart, query] = url.split('?');
  // Ensure leading slash
  const normalized = pathPart.startsWith('/') ? pathPart : '/' + pathPart;
  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 0) return url;
  const baseSeg = '/' + segments[0].toLowerCase();
  const mappedBase = routeMap[baseSeg];
  if (!mappedBase) return url; // No mapping needed
  const rest = segments.slice(1).join('/');
  const newPath = mappedBase + (rest ? '/' + rest : '');
  return query ? newPath + '?' + query : newPath;
}

/**
 * Pre-configured Axios instance for all API calls.
 *
 * - **baseURL**: Same-origin ('') when mocks are enabled, otherwise from `VITE_API_URL`.
 * - **withCredentials**: Allows cookies/credentials in CORS requests.
 * - **Interceptors**: Automatically attach Authorization header and handle errors.
 */
export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

// Augment the client with a tiny metadata bag for throttling toasts
type ApiClientWithMeta = typeof apiClient & { _last403At?: number };

// Simple token store (will be replaced by AuthContext)
let accessToken: string | null = null;

/**
 * Sets the JWT access token for subsequent API requests.
 *
 * @param token - The JWT token string, or `null` to clear the token.
 */
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

/**
 * Request interceptor: attach Authorization header with the JWT token.
 */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Rewrite URL path to backend controller naming if necessary.
  if (config.url) {
    config.url = translatePath(config.url);
  }
  if (accessToken) {
    const headers = config.headers || {};
    (headers as Record<string, unknown>)['Authorization'] = `Bearer ${accessToken}`;
    config.headers = headers;
  }
  return config;
});

/**
 * Response interceptor: handle 401 (unauthorized) and 403 (forbidden) errors globally.
 *
 * - **401**: Clears the access token (e.g., when expired).
 * - **403**: Shows a throttled toast message to the user.
 */
apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    // Placeholder refresh logic; integrate real endpoint later
    if (error.response?.status === 401) {
      // TODO: attempt refresh when backend supports /auth/refresh
      setAccessToken(null);
    }
    // Friendly message for forbidden operations
    if (error.response?.status === 403) {
      // Throttle duplicate toasts a bit
      const now = Date.now();
      const clientMeta = apiClient as ApiClientWithMeta;
      if (!clientMeta._last403At || now - clientMeta._last403At > 1500) {
        clientMeta._last403At = now;
        toast.error("You don't have permission to perform this action.");
      }
    }
    return Promise.reject(error);
  },
);
