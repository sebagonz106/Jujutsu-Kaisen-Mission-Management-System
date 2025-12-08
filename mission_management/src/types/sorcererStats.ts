/**
 * @fileoverview Type definitions for sorcerer statistics query results (RF-14).
 *
 * Defines the structure returned by the sorcerer statistics query.
 *
 * @module types/sorcererStats
 */

/**
 * Represents statistical data for a sorcerer.
 */
export interface SorcererStats {
  /** Sorcerer identifier. */
  hechiceroId: number;

  /** Sorcerer's name. */
  nombre: string;

  /** Sorcerer's grade/rank. */
  grado: string;

  /** Total number of missions assigned. */
  misionesTotales: number;

  /** Number of successful missions. */
  misionesExitosas: number;

  /** Success rate percentage (0-100). */
  porcentajeEfectividad: number;
}
