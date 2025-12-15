/**
 * @fileoverview Type definitions for sorcerer missions query results (Query2).
 *
 * Defines the structure returned by the missions by sorcerer query.
 *
 * @module types/query2Result
 */

/**
 * Represents a mission for a specific sorcerer.
 */
export interface Query2Result {
  /** Mission identifier. */
  misionId: number;

  /** Mission date (ISO date string). */
  fechaMision: string;

  /** Mission result status (e.g., "Éxito", "Fracaso", "En proceso"). */
  resultado: string | null;
}
