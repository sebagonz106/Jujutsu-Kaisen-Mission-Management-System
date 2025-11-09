import { apiClient, setAccessToken } from './client';
import type { LoginRequest, LoginResponse, MeResponse, RegisterRequest, RegisterResponse } from '../types/auth';

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    setAccessToken(data.accessToken);
    return data;
  },
  async me(): Promise<MeResponse> {
    const { data } = await apiClient.get<MeResponse>('/auth/me');
    return data;
  },
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await apiClient.post<RegisterResponse>('/auth/register', payload);
    setAccessToken(data.accessToken);
    return data;
  },
};
