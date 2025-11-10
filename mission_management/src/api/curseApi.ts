/**
 * @fileoverview API client methods for curse CRUD operations.
 *
 * Provides methods to interact with the `/curses` endpoint.
 *
 * @module api/curseApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Curse } from '../types/curse';

/**
 * Curse API methods.
 */
export const curseApi = {
  /**
   * Fetches all curses.
   *
   * @returns Promise resolving to array of curses.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Curse[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/curses${qs}`);
    return normalizePaged<Curse>(data, { limit: params?.limit });
  },

  /**
   * Fetches a single curse by ID.
   *
   * @param id - The curse ID.
   * @returns Promise resolving to the curse object.
   */
  async get(id: number): Promise<Curse> {
    const { data } = await apiClient.get<Curse>(`/curses/${id}`);
    return data;
  },

  /**
   * Creates a new curse.
   *
   * @param payload - The curse data (without ID).
   * @returns Promise resolving to the created curse with assigned ID.
   */
  async create(payload: Omit<Curse, 'id'>): Promise<Curse> {
    const { data } = await apiClient.post<Curse>('/curses', payload);
    return data;
  },

  /**
   * Updates an existing curse.
   *
   * @param id - The curse ID.
   * @param payload - Partial curse data to update.
   * @returns Promise resolving to the updated curse.
   */
  async update(id: number, payload: Partial<Omit<Curse, 'id'>>): Promise<Curse> {
    const { data } = await apiClient.put<Curse>(`/curses/${id}`, payload);
    return data;
  },

  /**
   * Deletes a curse.
   *
   * @param id - The curse ID.
   * @returns Promise resolving when deletion is complete.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/curses/${id}`);
  },
};
