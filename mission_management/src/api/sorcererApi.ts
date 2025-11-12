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

// Backend sorcerer shape (partial) including nested technique optional
interface BackendSorcerer {
  id: number; name: string; grado: Sorcerer['grado']; experiencia: number; estado: Sorcerer['estado'];
  tecnicaPrincipal?: { id: number; nombre: string } | null;
  tecnicaPrincipalId?: number; // in case backend ever returns flattened id
  [k: string]: unknown; // allow extra props safely
}
function normalizeSorcerer(raw: BackendSorcerer): Sorcerer {
  const tecnica = raw.tecnicaPrincipal;
  return {
    id: raw.id,
    name: raw.name,
    grado: raw.grado,
    experiencia: raw.experiencia,
    estado: raw.estado,
    tecnicaPrincipal: tecnica?.nombre ?? undefined,
    tecnicaPrincipalId: tecnica?.id ?? raw.tecnicaPrincipalId ?? undefined,
  };
}

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
    const norm = normalizePaged<BackendSorcerer>(data, { limit: params?.limit });
    return { ...norm, items: norm.items.map(normalizeSorcerer) };
  },

  /**
   * Fetches a single sorcerer by ID.
   *
   * @param id - The sorcerer ID.
   * @returns Promise resolving to the sorcerer object.
   */
  async get(id: number): Promise<Sorcerer> {
    const { data } = await apiClient.get<BackendSorcerer>(`/sorcerers/${id}`);
    return normalizeSorcerer(data);
  },

  /**
   * Creates a new sorcerer.
   *
   * @param payload - The sorcerer data (without ID).
   * @returns Promise resolving to the created sorcerer with assigned ID.
   */
  async create(payload: Omit<Sorcerer, 'id'>): Promise<Sorcerer> {
    const send: Record<string, unknown> = {
      name: payload.name,
      grado: payload.grado,
      experiencia: payload.experiencia,
      estado: payload.estado,
      tecnicaPrincipal: payload.tecnicaPrincipalId ? { id: payload.tecnicaPrincipalId } : null,
    };
    const { data } = await apiClient.post<BackendSorcerer>('/sorcerers', send);
    return normalizeSorcerer(data);
  },

  /**
   * Updates an existing sorcerer.
   *
   * @param id - The sorcerer ID.
   * @param payload - Partial sorcerer data to update.
   * @returns Promise resolving to the updated sorcerer.
   */
  async update(id: number, payload: Partial<Omit<Sorcerer, 'id'>>): Promise<void> {
    const send: Record<string, unknown> = { ...payload };
    if (Object.prototype.hasOwnProperty.call(payload, 'tecnicaPrincipalId')) {
      send.tecnicaPrincipal = payload.tecnicaPrincipalId ? { id: payload.tecnicaPrincipalId } : null;
      delete (send as Record<string, unknown>).tecnicaPrincipalId;
    }
    await apiClient.put(`/sorcerers/${id}`, send);
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
