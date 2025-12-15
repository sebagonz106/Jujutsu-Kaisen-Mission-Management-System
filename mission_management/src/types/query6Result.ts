/**
 * @fileoverview Type definitions for master-disciple relationship query results (Query6).
 *
 * Defines the structure returned by the master-disciple relations query.
 *
 * @module types/query6Result
 */

/**
 * Represents disciple information within master-disciple relationships.
 */
export interface DiscipuloInfo {
  /** Disciple identifier. */
  discipuloId: number;

  /** Disciple's name. */
  nombreDiscipulo: string | null;

  /** Disciple's grade/rank. */
  gradoDiscipulo: string | null;

  /** Type of relationship. */
  tipoRelacion: string | null;
}

/**
 * Represents master-disciple relationship data with mission statistics.
 */
export interface Query6Result {
  /** Master sorcerer identifier. */
  hechiceroId: number;

  /** Master sorcerer's name. */
  nombreHechicero: string | null;

  /** Master sorcerer's grade/rank. */
  grado: string | null;

  /** List of disciples under this master. */
  discipulos: DiscipuloInfo[];

  /** Total number of missions. */
  misionesTotales: number;

  /** Number of successful missions. */
  misionesExitosas: number;

  /** Number of failed missions. */
  misionesFallidas: number;

  /** Success percentage (0-100). */
  porcentajeExito: number;
}
