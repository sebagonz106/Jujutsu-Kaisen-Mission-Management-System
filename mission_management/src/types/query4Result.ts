/**
 * @fileoverview Type definitions for technique effectiveness query results (Query4).
 *
 * Defines the structure returned by the technique effectiveness query.
 *
 * @module types/query4Result
 */

/**
 * Represents technique effectiveness statistics for a sorcerer.
 */
export interface Query4Result {
  /** Sorcerer identifier. */
  hechiceroId: number;

  /** Sorcerer's name. */
  nombreHechicero: string | null;

  /** Sorcerer's grade/rank. */
  grado: string | null;

  /** Average effectiveness of techniques. */
  promedioEfectividad: number;

  /** Classification based on effectiveness (e.g., "Alta", "Media", "Baja"). */
  clasificacion: string | null;

  /** Number of techniques the sorcerer has mastered. */
  cantidadTecnicas: number;
}
