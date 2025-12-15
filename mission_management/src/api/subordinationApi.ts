/**
 * @fileoverview API client methods for subordination CRUD operations.
 *
 * Provides methods to interact with the `/subordinacion` endpoint.
 *
 * @module api/subordinationApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Subordination } from '../types/subordination';

/**
 * Subordination API methods.
 */
export const subordinationApi = {
  /**
   * Fetches all subordinations.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Subordination[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/subordinations${qs}`);
    const norm = normalizePaged<Subordination>(data, { limit: params?.limit });
    return norm;
  },

  /**
   * Fetches a single subordination by ID.
   */
  async get(id: number): Promise<Subordination> {
    const { data } = await apiClient.get<Subordination>(`/subordinations/${id}`);
    return data;
  },

  /**
   * Creates a new subordination.
   */
  async create(payload: Omit<Subordination, 'id'>): Promise<Subordination> {
    const { data } = await apiClient.post<Subordination>('/subordinations', payload);
    return data;
  },

  /**
   * Updates an existing subordination.
   */
  async update(id: number, payload: Partial<Omit<Subordination, 'id'>>): Promise<Subordination> {
    const { data } = await apiClient.put<Subordination>(`/subordinations/${id}`, payload);
    return data;
  },

  /**
   * Deletes a subordination.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/subordinations/${id}`);
  },

  /**
   * Checks if an active relationship exists between master and disciple.
   */
  async existsActiveRelation(maestroId: number, discipuloId: number): Promise<boolean> {
    const { data } = await apiClient.get<boolean>(`/subordinations/existe/${maestroId}/${discipuloId}`);
    return data;
  },
};
