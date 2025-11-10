/**
 * @fileoverview Type definitions for sorcerers.
 *
 * Defines sorcerer grades, statuses, and the Sorcerer entity interface.
 *
 * @module types/sorcerer
 */

/**
 * Available sorcerer grades.
 */
export const SORCERER_GRADE = {
  estudiante: 'estudiante',
  aprendiz: 'aprendiz',
  medio: 'medio',
  alto: 'alto',
  especial: 'especial',
} as const;

/**
 * Type for sorcerer grade.
 */
export type SorcererGrade = typeof SORCERER_GRADE[keyof typeof SORCERER_GRADE];

/**
 * Available sorcerer statuses.
 */
export const SORCERER_STATUS = {
  activo: 'activo',
  lesionado: 'lesionado',
  recuperandose: 'recuperandose',
  baja: 'baja',
  inactivo: 'inactivo',
} as const;

/**
 * Type for sorcerer status.
 */
export type SorcererStatus = typeof SORCERER_STATUS[keyof typeof SORCERER_STATUS];

/**
 * Represents a sorcerer entity.
 */
export interface Sorcerer {
  /** Unique sorcerer identifier. */
  id: number;

  /** Sorcerer's name. */
  name: string;

  /** Sorcerer's rank/grade. */
  grado: SorcererGrade;

  /** Sorcerer's experience points. */
  experiencia: number;

  /** Current status (active, injured, etc.). */
  estado: SorcererStatus;

  /** Main cursed technique name (simplified). */
  tecnicaPrincipal?: string;
}
