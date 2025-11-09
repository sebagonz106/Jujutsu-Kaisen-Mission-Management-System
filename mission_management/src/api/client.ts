import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';
// When using MSW in dev, use same-origin relative base URL so the Service Worker can intercept.
// Otherwise, fall back to configured API URL (or sensible default).
const baseURL = useMock ? '' : (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api');

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

// Simple token store (will be replaced by AuthContext)
let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

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

apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    // Placeholder refresh logic; integrate real endpoint later
    if (error.response?.status === 401) {
      // TODO: attempt refresh when backend supports /auth/refresh
      setAccessToken(null);
    }
    return Promise.reject(error);
  },
);
