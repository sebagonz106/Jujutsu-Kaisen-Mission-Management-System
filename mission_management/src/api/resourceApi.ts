/**
 * @fileoverview API client methods for resource CRUD operations.
 * Endpoint: `/resources` (translated to backend `/Recurso` via api/client routeMap).
 * @module api/resourceApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Resource, NewResource } from '../types/resource';

/**
 * Resource API client with CRUD operations.
 */
export const resourceApi = {
  /**
   * Fetches a paginated list of resources.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Resource[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/resources${qs}`);
    return normalizePaged<Resource>(data, { limit: params?.limit });
  },

  /**
   * Fetches a single resource by its ID.
   */
  async get(id: number): Promise<Resource> {
    const { data } = await apiClient.get<Resource>(`/resources/${id}`);
    return data;
  },

  /**
   * Creates a new resource.
   */
  async create(payload: NewResource): Promise<Resource> {
    const { data } = await apiClient.post<Resource>('/resources', payload);
    return data;
  },

  /**
   * Updates an existing resource.
   */
  async update(id: number, payload: Partial<NewResource>): Promise<Resource> {
    const { data } = await apiClient.put<Resource>(`/resources/${id}`, payload);
    return data;
  },

  /**
   * Deletes a resource by its ID.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/resources/${id}`);
  },
};
