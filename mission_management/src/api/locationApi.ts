/**
 * @fileoverview API client methods for location CRUD operations.
 * Endpoint: `/locations` (translated to backend `/Ubicacion` via api/client routeMap).
 * @module api/locationApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Location, NewLocation } from '../types/location';

/**
 * Location API client with CRUD operations.
 * Backend uses camelCase JSON serialization so we send/receive camelCase directly.
 */
export const locationApi = {
  /**
   * Fetches a paginated list of locations.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Location[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/locations${qs}`);
    return normalizePaged<Location>(data, { limit: params?.limit });
  },

  /**
   * Fetches a single location by its ID.
   */
  async get(id: number): Promise<Location> {
    const { data } = await apiClient.get<Location>(`/locations/${id}`);
    return data;
  },

  /**
   * Creates a new location.
   */
  async create(payload: NewLocation): Promise<Location> {
    const { data } = await apiClient.post<Location>('/locations', payload);
    return data;
  },

  /**
   * Updates an existing location.
   */
  async update(id: number, payload: Partial<NewLocation>): Promise<Location> {
    const { data } = await apiClient.put<Location>(`/locations/${id}`, payload);
    return data;
  },

  /**
   * Deletes a location by its ID.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/locations/${id}`);
  },
};
