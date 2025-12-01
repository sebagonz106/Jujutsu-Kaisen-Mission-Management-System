/**
 * @fileoverview API client methods for mastered technique (TecnicaMalditaDominada) CRUD operations.
 * Endpoint: `/mastered-techniques` (translated to backend `/TecnicaMalditaDominada` via api/client routeMap).
 * @module api/masteredTechniqueApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { MasteredTechnique, MasteredTechniquePayload } from '../types/masteredTechnique';

/**
 * Mastered Technique API client with CRUD operations.
 */
export const masteredTechniqueApi = {
  /**
   * Fetches a paginated list of mastered techniques.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: MasteredTechnique[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/mastered-techniques${qs}`);
    return normalizePaged<MasteredTechnique>(data, { limit: params?.limit });
  },

  /**
   * Fetches a single mastered technique by its ID.
   */
  async get(id: number): Promise<MasteredTechnique> {
    const { data } = await apiClient.get<MasteredTechnique>(`/mastered-techniques/${id}`);
    return data;
  },

  /**
   * Creates a new mastered technique.
   */
  async create(payload: MasteredTechniquePayload): Promise<MasteredTechnique> {
    const { data } = await apiClient.post<MasteredTechnique>('/mastered-techniques', payload);
    return data;
  },

  /**
   * Updates an existing mastered technique.
   */
  async update(id: number, payload: Partial<MasteredTechniquePayload>): Promise<MasteredTechnique> {
    const { data } = await apiClient.put<MasteredTechnique>(`/mastered-techniques/${id}`, payload);
    return data;
  },

  /**
   * Deletes a mastered technique by its ID.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/mastered-techniques/${id}`);
  },
};
