import { apiClient } from './client';
import type { Curse } from '../types/curse';

export const curseApi = {
  async list(): Promise<Curse[]> {
    const { data } = await apiClient.get<Curse[]>('/curses');
    return data;
  },
  async get(id: number): Promise<Curse> {
    const { data } = await apiClient.get<Curse>(`/curses/${id}`);
    return data;
  },
  async create(payload: Omit<Curse, 'id'>): Promise<Curse> {
    const { data } = await apiClient.post<Curse>('/curses', payload);
    return data;
  },
  async update(id: number, payload: Partial<Omit<Curse, 'id'>>): Promise<Curse> {
    const { data } = await apiClient.put<Curse>(`/curses/${id}`, payload);
    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/curses/${id}`);
  },
};
