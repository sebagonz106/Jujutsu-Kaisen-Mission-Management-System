/**
 * @fileoverview API client methods for transfer (Traslado) CRUD operations.
 * Endpoint: `/transfers` (translated to backend `/Traslado` via api/client routeMap).
 * @module api/transferApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Transfer, TransferPayload } from '../types/transfer';

/**
 * Transfer API client with CRUD operations.
 */
export const transferApi = {
  /**
   * Fetches a paginated list of transfers.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Transfer[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/transfers${qs}`);
    return normalizePaged<Transfer>(data, { limit: params?.limit });
  },

  /**
   * Fetches a single transfer by its ID.
   */
  async get(id: number): Promise<Transfer> {
    const { data } = await apiClient.get<Transfer>(`/transfers/${id}`);
    return data;
  },

  /**
   * Creates a new transfer.
   */
  async create(payload: TransferPayload): Promise<Transfer> {
    const { data } = await apiClient.post<Transfer>('/transfers', payload);
    return data;
  },

  /**
   * Updates an existing transfer.
   */
  async update(id: number, payload: Partial<TransferPayload>): Promise<Transfer> {
    const { data } = await apiClient.put<Transfer>(`/transfers/${id}`, payload);
    return data;
  },

  /**
   * Deletes a transfer by its ID.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/transfers/${id}`);
  },
};
