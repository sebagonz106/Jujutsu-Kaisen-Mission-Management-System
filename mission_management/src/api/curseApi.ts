/**
 * @fileoverview API client methods for curse CRUD operations.
 *
 * Provides methods to interact with the `/curses` endpoint.
 *
 * @module api/curseApi
 */

import { apiClient } from './client';
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
  async list(): Promise<Curse[]> {
    const { data } = await apiClient.get<Curse[]>('/curses');
    return data;
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
