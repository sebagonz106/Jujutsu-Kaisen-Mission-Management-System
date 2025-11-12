/**
 * @fileoverview API client methods for cursed technique CRUD operations.
 * Endpoint: `/techniques` (translated to backend `/TecnicaMaldita`).
 * @module api/techniqueApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Technique, NewTechnique, TechniquePatch } from '../types/technique';

// Backend TecnicaMaldita shape (PascalCase)
interface BackendTechnique {
  Id: number;
  Nombre: string;
  Tipo: Technique['tipo'];
  EfectividadProm: number; // int in backend
  CondicionesDeUso: string;
}

function normalizeTechnique(raw: BackendTechnique | Technique): Technique {
  // Accept both PascalCase (backend) and camelCase (mock) shapes
  if (isBackendTechnique(raw)) {
    return {
      id: raw.Id,
      nombre: raw.Nombre,
      tipo: raw.Tipo,
      efectividadProm: raw.EfectividadProm,
      condicionesDeUso: raw.CondicionesDeUso,
    };
  }
  return raw as Technique;
}

function isBackendTechnique(v: unknown): v is BackendTechnique {
  return typeof v === 'object' && v !== null && 'Id' in v && 'Nombre' in v && 'EfectividadProm' in v;
}

/**
 * Cursed Technique API client with CRUD operations.
 * All methods use the normalized pagination adapter for consistent response shapes.
 */
export const techniqueApi = {
  /**
   * Fetches a paginated list of cursed techniques.
   *
   * @param params - Optional pagination parameters
   * @param params.limit - Maximum number of items to return per page
   * @param params.cursor - Cursor for fetching the next page (typically the last item's ID from previous page)
   * @returns Promise resolving to normalized paginated response with items, nextCursor, and hasMore flag
   * @throws {AxiosError} When request fails (network error, 403 forbidden, 404 not found, etc.)
   *
   * @example
   * ```typescript
   * // Fetch first page (20 items)
   * const page1 = await techniqueApi.list({ limit: 20 });
   *
   * // Fetch next page using cursor
   * if (page1.hasMore) {
   *   const page2 = await techniqueApi.list({ limit: 20, cursor: page1.nextCursor });
   * }
   * ```
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Technique[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/techniques${qs}`);
    const norm = normalizePaged<BackendTechnique>(data, { limit: params?.limit });
    return { ...norm, items: norm.items.map(normalizeTechnique) };
  },

  /**
   * Fetches a single cursed technique by its ID.
   *
   * @param id - The unique identifier of the technique
   * @returns Promise resolving to the technique object
   * @throws {AxiosError} When technique not found (404) or request fails
   *
   * @example
   * ```typescript
   * const technique = await techniqueApi.get(42);
   * console.log(technique.nombre); // "Limitless"
   * console.log(technique.efectividadProm); // 95.5
   * ```
   */
  async get(id: number): Promise<Technique> {
    const { data } = await apiClient.get<BackendTechnique>(`/techniques/${id}`);
    return normalizeTechnique(data);
  },

  /**
   * Creates a new cursed technique.
   *
   * @param payload - The technique data (without ID, which is server-assigned)
   * @param payload.nombre - Display name of the technique
   * @param payload.tipo - Technique type (amplificacion, dominio, restriccion, soporte)
   * @param payload.efectividadProm - Average effectiveness rating (0-100 float)
   * @param payload.condicionesDeUso - Usage conditions or constraints
   * @returns Promise resolving to the created technique with assigned ID
   * @throws {AxiosError} When validation fails (400 - e.g., efectividadProm out of range), forbidden (403), or request fails
   *
   * @example
   * ```typescript
   * const newTechnique = await techniqueApi.create({
   *   nombre: 'Limitless',
   *   tipo: 'dominio',
   *   efectividadProm: 95.5,
   *   condicionesDeUso: 'Requires Six Eyes'
   * });
   * console.log(newTechnique.id); // 123 (server-assigned)
   * ```
   */
  async create(payload: NewTechnique): Promise<Technique> {
    // Backend expects integer for EfectividadProm
    const send: BackendTechnique = {
      Id: 0,
      Nombre: payload.nombre,
      Tipo: payload.tipo,
      EfectividadProm: Math.round(payload.efectividadProm ?? 0),
      CondicionesDeUso: payload.condicionesDeUso ?? 'ninguna',
    };
    const { data } = await apiClient.post<BackendTechnique>('/techniques', send);
    return normalizeTechnique(data);
  },

  /**
   * Updates an existing cursed technique (partial update supported).
   *
   * @param id - The unique identifier of the technique to update
   * @param payload - Partial technique data to update (only provided fields are updated)
   * @returns Promise resolving to the updated technique object
   * @throws {AxiosError} When technique not found (404), validation fails (400), forbidden (403), or request fails
   *
   * @example
   * ```typescript
   * const updated = await techniqueApi.update(123, {
   *   efectividadProm: 98.0, // Only update effectiveness
   *   condicionesDeUso: 'Requires Six Eyes and immense cursed energy'
   * });
   * ```
   */
  async update(id: number, payload: TechniquePatch): Promise<void> {
    const send: Partial<BackendTechnique> = {};
    if (payload.nombre !== undefined) send.Nombre = payload.nombre;
    if (payload.tipo !== undefined) send.Tipo = payload.tipo;
    if (payload.efectividadProm !== undefined) send.EfectividadProm = Math.round(payload.efectividadProm);
    if (payload.condicionesDeUso !== undefined) send.CondicionesDeUso = payload.condicionesDeUso ?? 'ninguna';
    await apiClient.put(`/techniques/${id}`, send);
  },

  /**
   * Deletes a cursed technique by its ID.
   *
   * @param id - The unique identifier of the technique to delete
   * @returns Promise resolving when deletion is complete (void)
   * @throws {AxiosError} When technique not found (404), forbidden (403), or request fails
   *
   * @example
   * ```typescript
   * await techniqueApi.remove(123);
   * // Technique deleted, no return value
   * ```
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/techniques/${id}`);
  },
};
