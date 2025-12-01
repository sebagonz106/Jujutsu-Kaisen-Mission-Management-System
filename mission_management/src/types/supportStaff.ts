/**
 * @fileoverview Type definitions for support staff (PersonalDeApoyo).
 * Matches backend model `PersonalDeApoyo` (Id, Name, Estado).
 * Uses Hechicero.EEstado for status values.
 * @module types/supportStaff
 */

/** Status enum matching backend Hechicero.EEstado (shared with sorcerers) */
export type StaffStatus = 
  | 'activo'
  | 'lesionado'
  | 'recuperandose'
  | 'baja'
  | 'inactivo';

/** Represents support staff personnel. */
export interface SupportStaff {
  /** Unique identifier (backend `Id`). */
  id: number;
  /** Staff member name (backend `Name`). */
  name: string;
  /** Staff status (backend `Estado`). */
  estado: StaffStatus;
}

/** Payload for creating new support staff (id is server-assigned). */
export type NewSupportStaff = Omit<SupportStaff, 'id'>;
