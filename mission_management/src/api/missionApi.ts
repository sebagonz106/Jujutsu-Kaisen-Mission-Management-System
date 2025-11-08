import { apiClient } from './client';
import type { Mission } from '../types/mission';

export const missionApi = {
  async list(): Promise<Mission[]> {
    const { data } = await apiClient.get<Mission[]>('/missions');
    return data;
  },
  async get(id: number): Promise<Mission> {
    const { data } = await apiClient.get<Mission>(`/missions/${id}`);
    return data;
  },
  async create(payload: Omit<Mission, 'id'>): Promise<Mission> {
    const { data } = await apiClient.post<Mission>('/missions', payload);
    return data;
  },
  async update(id: number, payload: Partial<Omit<Mission, 'id'>>): Promise<Mission> {
    const { data } = await apiClient.put<Mission>(`/missions/${id}`, payload);
    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/missions/${id}`);
  },
};
