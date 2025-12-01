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

interface BackendUbicacion { id: number; nombre: string }
interface BackendCurse {
  id: number; nombre: string; fechaYHoraDeAparicion: string;
  grado: Curse['grado']; tipo: Curse['tipo']; estadoActual: Curse['estadoActual']; nivelPeligro: Curse['nivelPeligro'];
  ubicacionDeAparicion?: BackendUbicacion | string; // backend real = object; mock = string
}

function normalizeCurse(raw: BackendCurse): Curse {
  const loc = raw.ubicacionDeAparicion;
  let ubicacionId: number | undefined;
  let ubicacionNombre: string = '';
  if (typeof loc === 'object' && loc !== null) {
    ubicacionId = (loc as BackendUbicacion).id;
    ubicacionNombre = (loc as BackendUbicacion).nombre;
  } else if (typeof loc === 'string') {
    ubicacionNombre = loc;
  }
  return {
    id: raw.id,
    nombre: raw.nombre,
    fechaYHoraDeAparicion: raw.fechaYHoraDeAparicion,
    grado: raw.grado,
    tipo: raw.tipo,
    estadoActual: raw.estadoActual,
    nivelPeligro: raw.nivelPeligro,
    ubicacionDeAparicion: ubicacionNombre,
    ubicacionId,
  };
}

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
    const norm = normalizePaged<BackendCurse>(data, { limit: params?.limit });
    return { ...norm, items: norm.items.map(normalizeCurse) };
  },

  /**
   * Fetches a single curse by ID.
   *
   * @param id - The curse ID.
   * @returns Promise resolving to the curse object.
   */
  async get(id: number): Promise<Curse> {
    const { data } = await apiClient.get<BackendCurse>(`/curses/${id}`);
    return normalizeCurse(data);
  },

  /**
   * Creates a new curse.
   *
   * @param payload - The curse data (without ID).
   * @returns Promise resolving to the created curse with assigned ID.
   */
  async create(payload: Omit<Curse, 'id'>): Promise<Curse> {
    const send: Record<string, unknown> = {
      nombre: payload.nombre,
      fechaYHoraDeAparicion: payload.fechaYHoraDeAparicion,
      grado: payload.grado,
      tipo: payload.tipo,
      estadoActual: payload.estadoActual,
      nivelPeligro: payload.nivelPeligro,
      ubicacionDeAparicionId: payload.ubicacionId,
    };
    const { data } = await apiClient.post<BackendCurse>('/curses', send);
    return normalizeCurse(data);
  },

  /**
   * Updates an existing curse.
   *
   * @param id - The curse ID.
   * @param payload - Partial curse data to update.
   * @returns Promise resolving to the updated curse.
   */
  async update(id: number, payload: Partial<Omit<Curse, 'id'>>): Promise<void> {
    const send: Record<string, unknown> = { ...payload };
    if (Object.prototype.hasOwnProperty.call(payload, 'ubicacionId')) {
      send.ubicacionDeAparicionId = payload.ubicacionId;
      delete (send as Record<string, unknown>).ubicacionId;
      delete (send as Record<string, unknown>).ubicacionDeAparicion;
    }
    await apiClient.put(`/curses/${id}`, send);
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
