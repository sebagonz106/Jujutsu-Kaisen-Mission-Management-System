/**
 * @fileoverview API client methods for mission CRUD operations.
 *
 * Provides methods to interact with the `/missions` endpoint.
 *
 * @module api/missionApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Mission } from '../types/mission';

/**
 * Mission API methods.
 */
export const missionApi = {
  /**
   * Fetches all missions.
   *
   * @returns Promise resolving to array of missions.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Mission[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/missions${qs}`);
    return normalizePaged<Mission>(data, { limit: params?.limit });
  },

  /**
   * Fetches a single mission by ID.
   *
   * @param id - The mission ID.
   * @returns Promise resolving to the mission object.
   */
  async get(id: number): Promise<Mission> {
    const { data } = await apiClient.get<Mission>(`/missions/${id}`);
    return data;
  },

  /**
   * Creates a new mission.
   *
   * @param payload - The mission data (without ID).
   * @returns Promise resolving to the created mission with assigned ID.
   */
  async create(payload: Omit<Mission, 'id'>): Promise<Mission> {
    const { data } = await apiClient.post<Mission>('/missions', payload);
    return data;
  },

  /**
   * Updates an existing mission.
   *
   * @param id - The mission ID.
   * @param payload - Partial mission data to update.
   * @returns Promise resolving to the updated mission.
   */
  async update(id: number, payload: Partial<Omit<Mission, 'id'>>): Promise<Mission> {
    const { data } = await apiClient.put<Mission>(`/missions/${id}`, payload);
    return data;
  },

  /**
   * Deletes a mission.
   *
   * @param id - The mission ID.
   * @returns Promise resolving when deletion is complete.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/missions/${id}`);
  },
};
