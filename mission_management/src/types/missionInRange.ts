/**
 * @fileoverview Type definitions for mission date range query results (RF-13).
 *
 * Defines the structure returned by the missions in date range query.
 *
 * @module types/missionInRange
 */

/**
 * Represents a mission within a date range query result.
 */
export interface MissionInRange {
  /** Mission identifier. */
  misionId: number;

  /** Mission start date (ISO date string). */
  fechaInicio: string;

  /** Mission end date (ISO date string, nullable if ongoing). */
  fechaFin: string | null;

  /** Location name where mission takes place. */
  ubicacion: string;

  /** Name of the curse associated with the mission. */
  maldicion: string;

  /** List of sorcerer names assigned to the mission. */
  hechiceros: string[];

  /** List of technique names used in the mission. */
  tecnicas: string[];
}
