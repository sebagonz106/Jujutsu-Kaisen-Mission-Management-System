import { apiClient } from './client';

export interface UsuarioDto {
  id: number;
  nombre: string;
  email: string;
  rol: 'observer' | 'support' | 'sorcerer' | 'admin' | string;
  rango?: string | null;
  creadoEn: string;
}

export interface CreateUsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  rol: string;
  rango?: string | null;
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: string;
  rango?: string | null;
}

export const userApi = {
  async list(): Promise<UsuarioDto[]> {
    const { data } = await apiClient.get('/users');
    return data;
  },
  async get(id: number): Promise<UsuarioDto> {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },
  async create(payload: CreateUsuarioRequest): Promise<UsuarioDto> {
    const { data } = await apiClient.post('/users', payload);
    return data;
  },
  async update(id: number, payload: UpdateUsuarioRequest): Promise<UsuarioDto> {
    const { data } = await apiClient.put(`/users/${id}`, payload);
    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
  async setRole(id: number, rol: string): Promise<void> {
    await apiClient.post(`/users/${id}/role`, { rol });
  },
};
