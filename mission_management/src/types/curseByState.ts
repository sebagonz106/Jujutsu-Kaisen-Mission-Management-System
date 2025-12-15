/**
 * @fileoverview Type definitions for curses by state query results.
 *
 * Matches backend model `MaldicionEnEstado` which is a simplified view
 * of curses filtered by their current state.
 *
 * @module types/curseByState
 */

/**
 * Represents a curse filtered by state (query result).
 * This is a simplified view returned by the backend for the
 * "Maldiciones por Estado" query.
 */
export interface CurseByState {
  /** Curse ID (used for cursor pagination). */
  id: number;
  
  /** Curse name (backend `NombreMaldicion`). */
  nombreMaldicion: string;
  
  /** Location where the curse appeared (backend `Ubicacion`). */
  ubicacion: string;
  
  /** Curse grade (backend `Grado`). */
  grado: string;
  
  /** Name of the sorcerer handling this curse (backend `NombreHechicero`). */
  nombreHechicero: string;
}
