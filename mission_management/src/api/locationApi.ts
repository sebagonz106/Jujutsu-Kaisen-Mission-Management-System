/**
 * @fileoverview API client methods for location CRUD operations.
 * Endpoint: `/locations` (translated to backend `/Ubicacion` via api/client routeMap).
 * @module api/locationApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Location, NewLocation } from '../types/location';

export const locationApi = {
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Location[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/locations${qs}`);
    return normalizePaged<Location>(data, { limit: params?.limit });
  },
  async get(id: number): Promise<Location> {
    const { data } = await apiClient.get<Location>(`/locations/${id}`);
    return data;
  },
  async create(payload: NewLocation): Promise<Location> {
    const { data } = await apiClient.post<Location>('/locations', payload);
    return data;
  },
  async update(id: number, payload: Partial<NewLocation>): Promise<Location> {
    const { data } = await apiClient.put<Location>(`/locations/${id}`, payload);
    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/locations/${id}`);
  },
};
