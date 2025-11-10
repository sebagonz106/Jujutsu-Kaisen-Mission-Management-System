/**
 * @fileoverview API client methods for sorcerer CRUD operations.
 *
 * Provides methods to interact with the `/sorcerers` endpoint.
 *
 * @module api/sorcererApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Sorcerer } from '../types/sorcerer';

/**
 * Sorcerer API methods.
 */
export const sorcererApi = {
  /**
   * Fetches all sorcerers.
   *
   * @returns Promise resolving to array of sorcerers.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Sorcerer[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/sorcerers${qs}`);
    const norm = normalizePaged<Sorcerer>(data, { limit: params?.limit });
    return norm;
  },

  /**
   * Fetches a single sorcerer by ID.
   *
   * @param id - The sorcerer ID.
   * @returns Promise resolving to the sorcerer object.
   */
  async get(id: number): Promise<Sorcerer> {
    const { data } = await apiClient.get<Sorcerer>(`/sorcerers/${id}`);
    return data;
  },

  /**
   * Creates a new sorcerer.
   *
   * @param payload - The sorcerer data (without ID).
   * @returns Promise resolving to the created sorcerer with assigned ID.
   */
  async create(payload: Omit<Sorcerer, 'id'>): Promise<Sorcerer> {
    const { data } = await apiClient.post<Sorcerer>('/sorcerers', payload);
    return data;
  },

  /**
   * Updates an existing sorcerer.
   *
   * @param id - The sorcerer ID.
   * @param payload - Partial sorcerer data to update.
   * @returns Promise resolving to the updated sorcerer.
   */
  async update(id: number, payload: Partial<Omit<Sorcerer, 'id'>>): Promise<Sorcerer> {
    const { data } = await apiClient.put<Sorcerer>(`/sorcerers/${id}`, payload);
    return data;
  },

  /**
   * Deletes a sorcerer.
   *
   * @param id - The sorcerer ID.
   * @returns Promise resolving when deletion is complete.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/sorcerers/${id}`);
  },
};
