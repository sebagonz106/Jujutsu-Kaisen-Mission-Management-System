import { apiClient } from './client';
import type { Sorcerer } from '../types/sorcerer';

export const sorcererApi = {
  async list(): Promise<Sorcerer[]> {
    const { data } = await apiClient.get<Sorcerer[]>('/sorcerers');
    return data;
  },
  async get(id: number): Promise<Sorcerer> {
    const { data } = await apiClient.get<Sorcerer>(`/sorcerers/${id}`);
    return data;
  },
  async create(payload: Omit<Sorcerer, 'id'>): Promise<Sorcerer> {
    const { data } = await apiClient.post<Sorcerer>('/sorcerers', payload);
    return data;
  },
  async update(id: number, payload: Partial<Omit<Sorcerer, 'id'>>): Promise<Sorcerer> {
    const { data } = await apiClient.put<Sorcerer>(`/sorcerers/${id}`, payload);
    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/sorcerers/${id}`);
  },
};
