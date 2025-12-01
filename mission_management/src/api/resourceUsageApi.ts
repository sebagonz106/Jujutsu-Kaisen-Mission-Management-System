/**
 * @fileoverview API client methods for resource usage (UsoDeRecurso) CRUD operations.
 * Endpoint: `/resource-usages` (translated to backend `/UsoDeRecurso` via api/client routeMap).
 * @module api/resourceUsageApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { ResourceUsage, ResourceUsagePayload } from '../types/resourceUsage';

/**
 * Resource Usage API client with CRUD operations.
 */
export const resourceUsageApi = {
  /**
   * Fetches a paginated list of resource usages.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: ResourceUsage[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/resource-usages${qs}`);
    return normalizePaged<ResourceUsage>(data, { limit: params?.limit });
  },

  /**
   * Fetches a single resource usage by its ID.
   */
  async get(id: number): Promise<ResourceUsage> {
    const { data } = await apiClient.get<ResourceUsage>(`/resource-usages/${id}`);
    return data;
  },

  /**
   * Creates a new resource usage.
   */
  async create(payload: ResourceUsagePayload): Promise<ResourceUsage> {
    const { data } = await apiClient.post<ResourceUsage>('/resource-usages', payload);
    return data;
  },

  /**
   * Updates an existing resource usage.
   */
  async update(id: number, payload: Partial<ResourceUsagePayload>): Promise<ResourceUsage> {
    const { data } = await apiClient.put<ResourceUsage>(`/resource-usages/${id}`, payload);
    return data;
  },

  /**
   * Deletes a resource usage by its ID.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/resource-usages/${id}`);
  },
};
