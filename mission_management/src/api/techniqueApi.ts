/**
 * @fileoverview API client methods for cursed technique CRUD operations.
 * Endpoint: `/techniques` (translated to backend `/TecnicaMaldita`).
 * @module api/techniqueApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Technique, NewTechnique, TechniquePatch } from '../types/technique';

/**
 * Cursed Technique API client with CRUD operations.
 * All methods use the normalized pagination adapter for consistent response shapes.
 * Backend uses camelCase JSON serialization so we send/receive camelCase directly.
 */
export const techniqueApi = {
  /**
   * Fetches a paginated list of cursed techniques.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Technique[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/techniques${qs}`);
    const norm = normalizePaged<Technique>(data, { limit: params?.limit });
    return norm;
  },

  /**
   * Fetches a single cursed technique by its ID.
   */
  async get(id: number): Promise<Technique> {
    const { data } = await apiClient.get<Technique>(`/techniques/${id}`);
    return data;
  },

  /**
   * Creates a new cursed technique.
   */
  async create(payload: NewTechnique): Promise<Technique> {
    const send = {
      nombre: payload.nombre,
      tipo: payload.tipo,
      efectividadProm: Math.round(payload.efectividadProm ?? 0),
      condicionesDeUso: payload.condicionesDeUso ?? 'ninguna',
    };
    const { data } = await apiClient.post<Technique>('/techniques', send);
    return data;
  },

  /**
   * Updates an existing cursed technique (partial update supported).
   */
  async update(id: number, payload: TechniquePatch): Promise<void> {
    const send: Record<string, unknown> = {};
    if (payload.nombre !== undefined) send.nombre = payload.nombre;
    if (payload.tipo !== undefined) send.tipo = payload.tipo;
    if (payload.efectividadProm !== undefined) send.efectividadProm = Math.round(payload.efectividadProm);
    if (payload.condicionesDeUso !== undefined) send.condicionesDeUso = payload.condicionesDeUso ?? 'ninguna';
    await apiClient.put(`/techniques/${id}`, send);
  },

  /**
   * Deletes a cursed technique by its ID.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/techniques/${id}`);
  },
};
