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
const baseURL = useMock ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api');

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
  if (accessToken) {
    // For Axios v1, config.headers may be an AxiosHeaders instance; mutate rather than replace to satisfy types.
    const headers = config.headers || {};
    // Use bracket to avoid TS index signature complaints.
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
