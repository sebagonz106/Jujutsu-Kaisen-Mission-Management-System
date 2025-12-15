/**
 * @fileoverview Type definitions for sorcerer ranking query results.
 *
 * Defines the structure returned by the sorcerer ranking by level and location query.
 *
 * @module types/rankingHechicero
 */

/**
 * Represents a sorcerer in the ranking by level and location.
 */
export interface RankingHechicero {
  /** Mission urgency level (e.g., "EmergenciaCritica", "Urgente", "Normal"). */
  nivelMision: string;

  /** Sorcerer identifier. */
  hechiceroId: number;

  /** Sorcerer's name. */
  nombreHechicero: string;

  /** Total number of missions at this level. */
  totalMisiones: number;

  /** Number of successful missions. */
  misionesExitosas: number;

  /** Success percentage (0-100). */
  porcentajeExito: number;
}
