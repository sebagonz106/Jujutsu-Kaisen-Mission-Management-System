export const CURSE_GRADE = {
  grado_1: 'grado_1',
  grado_2: 'grado_2',
  grado_3: 'grado_3',
  semi_especial: 'semi_especial',
  especial: 'especial',
} as const;
export type CurseGrade = typeof CURSE_GRADE[keyof typeof CURSE_GRADE];

export const CURSE_TYPE = {
  maligna: 'maligna',
  semi_maldicion: 'semi_maldicion',
  residual: 'residual',
  desconocida: 'desconocida',
} as const;
export type CurseType = typeof CURSE_TYPE[keyof typeof CURSE_TYPE];

export const CURSE_STATE = {
  activa: 'activa',
  en_proceso_de_exorcismo: 'en_proceso_de_exorcismo',
  exorcisada: 'exorcisada',
} as const;
export type CurseState = typeof CURSE_STATE[keyof typeof CURSE_STATE];

export const CURSE_DANGER_LEVEL = {
  bajo: 'bajo',
  moderado: 'moderado',
  alto: 'alto',
} as const;
export type CurseDangerLevel = typeof CURSE_DANGER_LEVEL[keyof typeof CURSE_DANGER_LEVEL];

export interface Curse {
  id: number;
  nombre: string;
  fechaYHoraDeAparicion: string; // ISO date string
  grado: CurseGrade;
  tipo: CurseType;
  estadoActual: CurseState;
  nivelPeligro: CurseDangerLevel;
  ubicacionDeAparicion: string; // Simplified until Ubicacion model arrives
}
