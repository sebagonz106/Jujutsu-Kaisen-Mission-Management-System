/**
 * @fileoverview Type definitions for mission locations.
 * Matches backend model `Ubicacion` (Id, Nombre).
 * Keep Spanish field names to align with API payloads and avoid mapping overhead.
 * @module types/location
 */

/** Represents a physical or strategic location used by missions and curses. */
export interface Location {
  /** Unique identifier (backend `Id`). */
  id: number;
  /** Display name (backend `Nombre`). */
  nombre: string;
}

/** Payload for creating a new location (id is server-assigned). */
export type NewLocation = Omit<Location, 'id'>;
