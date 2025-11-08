export const SORCERER_GRADE = {
  estudiante: 'estudiante',
  aprendiz: 'aprendiz',
  medio: 'medio',
  alto: 'alto',
  especial: 'especial',
} as const;

export type SorcererGrade = typeof SORCERER_GRADE[keyof typeof SORCERER_GRADE];

export const SORCERER_STATUS = {
  activo: 'activo',
  lesionado: 'lesionado',
  recuperandose: 'recuperandose',
  baja: 'baja',
  inactivo: 'inactivo',
} as const;

export type SorcererStatus = typeof SORCERER_STATUS[keyof typeof SORCERER_STATUS];

export interface Sorcerer {
  id: number;
  name: string;
  grado: SorcererGrade;
  experiencia: number;
  estado: SorcererStatus;
  tecnicaPrincipal?: string; // TecnicaMaldita nombre simplificado
}
