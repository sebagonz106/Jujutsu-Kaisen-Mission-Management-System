/**
 * @fileoverview API client methods for location CRUD operations.
 * Endpoint: `/locations` (translated to backend `/Ubicacion` via api/client routeMap).
 * @module api/locationApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Location, NewLocation } from '../types/location';

// Backend Ubicacion shape (PascalCase)
interface BackendLocation { Id: number; Nombre: string }

function normalizeLocation(raw: BackendLocation | Location): Location {
  // Accept both PascalCase (backend) and camelCase (mock) shapes
  if (isBackendLocation(raw)) {
    return { id: raw.Id, nombre: raw.Nombre };
  }
  return raw as Location;
}

function isBackendLocation(v: unknown): v is BackendLocation {
  return typeof v === 'object' && v !== null && 'Id' in v && 'Nombre' in v;
}

/**
 * Location API client with CRUD operations.
 * All methods use the normalized pagination adapter for consistent response shapes.
 */
export const locationApi = {
  /**
   * Fetches a paginated list of locations.
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
   * const page1 = await locationApi.list({ limit: 20 });
   *
   * // Fetch next page using cursor
   * if (page1.hasMore) {
   *   const page2 = await locationApi.list({ limit: 20, cursor: page1.nextCursor });
   * }
   * ```
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Location[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/locations${qs}`);
    const norm = normalizePaged<BackendLocation>(data, { limit: params?.limit });
    return { ...norm, items: norm.items.map(normalizeLocation) };
  },

  /**
   * Fetches a single location by its ID.
   *
   * @param id - The unique identifier of the location
   * @returns Promise resolving to the location object
   * @throws {AxiosError} When location not found (404) or request fails
   *
   * @example
   * ```typescript
   * const location = await locationApi.get(42);
   * console.log(location.nombre); // "Tokyo Metropolitan Magic Technical College"
   * ```
   */
  async get(id: number): Promise<Location> {
    const { data } = await apiClient.get<BackendLocation>(`/locations/${id}`);
    return normalizeLocation(data);
  },

  /**
   * Creates a new location.
   *
   * @param payload - The location data (without ID, which is server-assigned)
   * @param payload.nombre - Display name of the location (min 2 characters)
   * @returns Promise resolving to the created location with assigned ID
   * @throws {AxiosError} When validation fails (400), forbidden (403), or request fails
   *
   * @example
   * ```typescript
   * const newLocation = await locationApi.create({
   *   nombre: 'Shibuya Station'
   * });
   * console.log(newLocation.id); // 123 (server-assigned)
   * ```
   */
  async create(payload: NewLocation): Promise<Location> {
    // Send camelCase to keep compatibility with mock handlers and backend default camelCase serialization
    const { data } = await apiClient.post<Location>('/locations', payload);
    return normalizeLocation(data as unknown as Location);
  },

  /**
   * Updates an existing location (partial update supported).
   *
   * @param id - The unique identifier of the location to update
   * @param payload - Partial location data to update (only provided fields are updated)
   * @returns Promise resolving to the updated location object
   * @throws {AxiosError} When location not found (404), validation fails (400), forbidden (403), or request fails
   *
   * @example
   * ```typescript
   * const updated = await locationApi.update(123, {
   *   nombre: 'Shibuya Station (Updated)'
   * });
   * ```
   */
  async update(id: number, payload: Partial<NewLocation>): Promise<Location> {
    const { data } = await apiClient.put<Location>(`/locations/${id}`, payload);
    return normalizeLocation(data as unknown as Location);
  },

  /**
   * Deletes a location by its ID.
   *
   * @param id - The unique identifier of the location to delete
   * @returns Promise resolving when deletion is complete (void)
   * @throws {AxiosError} When location not found (404), forbidden (403), or request fails
   *
   * @example
   * ```typescript
   * await locationApi.remove(123);
   * // Location deleted, no return value
   * ```
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/locations/${id}`);
  },
};
