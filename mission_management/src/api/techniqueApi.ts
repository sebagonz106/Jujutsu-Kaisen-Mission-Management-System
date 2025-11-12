/**
 * @fileoverview API client methods for cursed technique CRUD operations.
 * Endpoint: `/techniques` (translated to backend `/TecnicaMaldita`).
 * @module api/techniqueApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Technique, NewTechnique, TechniquePatch } from '../types/technique';

export const techniqueApi = {
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Technique[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/techniques${qs}`);
    return normalizePaged<Technique>(data, { limit: params?.limit });
  },
  async get(id: number): Promise<Technique> {
    const { data } = await apiClient.get<Technique>(`/techniques/${id}`);
    return data;
  },
  async create(payload: NewTechnique): Promise<Technique> {
    const { data } = await apiClient.post<Technique>('/techniques', payload);
    return data;
  },
  async update(id: number, payload: TechniquePatch): Promise<Technique> {
    const { data } = await apiClient.put<Technique>(`/techniques/${id}`, payload);
    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/techniques/${id}`);
  },
};
