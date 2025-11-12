/**
 * @fileoverview Type definitions for curses.
 *
 * Defines curse grades, types, states, danger levels, and the Curse entity interface.
 *
 * @module types/curse
 */

/**
 * Available curse grades.
 */
export const CURSE_GRADE = {
  grado_1: 'grado_1',
  grado_2: 'grado_2',
  grado_3: 'grado_3',
  semi_especial: 'semi_especial',
  especial: 'especial',
} as const;

/**
 * Type for curse grade.
 */
export type CurseGrade = typeof CURSE_GRADE[keyof typeof CURSE_GRADE];

/**
 * Available curse types.
 */
export const CURSE_TYPE = {
  maligna: 'maligna',
  semi_maldicion: 'semi_maldicion',
  residual: 'residual',
  desconocida: 'desconocida',
} as const;

/**
 * Type for curse type.
 */
export type CurseType = typeof CURSE_TYPE[keyof typeof CURSE_TYPE];

/**
 * Available curse states.
 */
export const CURSE_STATE = {
  activa: 'activa',
  en_proceso_de_exorcismo: 'en_proceso_de_exorcismo',
  exorcisada: 'exorcisada',
} as const;

/**
 * Type for curse state.
 */
export type CurseState = typeof CURSE_STATE[keyof typeof CURSE_STATE];

/**
 * Available curse danger levels.
 */
export const CURSE_DANGER_LEVEL = {
  bajo: 'bajo',
  moderado: 'moderado',
  alto: 'alto',
} as const;

/**
 * Type for curse danger level.
 */
export type CurseDangerLevel = typeof CURSE_DANGER_LEVEL[keyof typeof CURSE_DANGER_LEVEL];

/**
 * Represents a curse entity.
 */
export interface Curse {
  /** Unique curse identifier. */
  id: number;

  /** Curse's name. */
  nombre: string;

  /** Date and time of curse appearance (ISO date string). */
  fechaYHoraDeAparicion: string;

  /** Curse's grade/rank. */
  grado: CurseGrade;

  /** Curse type. */
  tipo: CurseType;

  /** Current state (active, being exorcised, exorcised). */
  estadoActual: CurseState;

  /** Danger level assessment. */
  nivelPeligro: CurseDangerLevel;

  /** Location of curse appearance (simplified string until Ubicacion model is implemented). */
  ubicacionDeAparicion: string;
  /** Related location ID (strict select). */
  ubicacionId?: number;
}
