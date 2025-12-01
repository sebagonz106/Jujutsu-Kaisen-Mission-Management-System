/**
 * @fileoverview API client methods for request/solicitud CRUD operations.
 * Endpoint: `/requests` (translated to backend `/Solicitud` via api/client routeMap).
 * @module api/requestApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Request, NewRequest } from '../types/request';

/**
 * Request/Solicitud API client with CRUD operations.
 */
export const requestApi = {
  /**
   * Fetches a paginated list of requests.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Request[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/requests${qs}`);
    return normalizePaged<Request>(data, { limit: params?.limit });
  },

  /**
   * Fetches a single request by its ID.
   */
  async get(id: number): Promise<Request> {
    const { data } = await apiClient.get<Request>(`/requests/${id}`);
    return data;
  },

  /**
   * Creates a new request.
   */
  async create(payload: NewRequest): Promise<Request> {
    const { data } = await apiClient.post<Request>('/requests', payload);
    return data;
  },

  /**
   * Updates an existing request.
   */
  async update(id: number, payload: Partial<NewRequest>): Promise<Request> {
    const { data } = await apiClient.put<Request>(`/requests/${id}`, payload);
    return data;
  },

  /**
   * Deletes a request by its ID.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/requests/${id}`);
  },
};
