/**
 * @fileoverview API client methods for sorcerer-in-charge (HechiceroEncargado) CRUD operations.
 * Endpoint: `/sorcerers-in-charge` (translated to backend `/HechiceroEncargado` via api/client routeMap).
 * @module api/sorcererInChargeApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { SorcererInCharge, SorcererInChargePayload } from '../types/sorcererInCharge';

/**
 * Sorcerer In Charge API client with CRUD operations.
 */
export const sorcererInChargeApi = {
  /**
   * Fetches a paginated list of sorcerers-in-charge.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: SorcererInCharge[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/sorcerers-in-charge${qs}`);
    return normalizePaged<SorcererInCharge>(data, { limit: params?.limit });
  },

  /**
   * Fetches a single sorcerer-in-charge by its ID.
   */
  async get(id: number): Promise<SorcererInCharge> {
    const { data } = await apiClient.get<SorcererInCharge>(`/sorcerers-in-charge/${id}`);
    return data;
  },

  /**
   * Creates a new sorcerer-in-charge.
   */
  async create(payload: SorcererInChargePayload): Promise<SorcererInCharge> {
    const { data } = await apiClient.post<SorcererInCharge>('/sorcerers-in-charge', payload);
    return data;
  },

  /**
   * Updates an existing sorcerer-in-charge.
   */
  async update(id: number, payload: Partial<SorcererInChargePayload>): Promise<SorcererInCharge> {
    const { data } = await apiClient.put<SorcererInCharge>(`/sorcerers-in-charge/${id}`, payload);
    return data;
  },

  /**
   * Deletes a sorcerer-in-charge by its ID.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/sorcerers-in-charge/${id}`);
  },
};
