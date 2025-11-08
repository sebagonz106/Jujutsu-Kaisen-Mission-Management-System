import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

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
    // Ensure headers object exists
    config.headers.set('Authorization', `Bearer ${accessToken}`);
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
