/**
 * @fileoverview Type definitions for cursed techniques (TecnicaMaldita).
 * @module types/technique
 */

export type TechniqueType = 'amplificacion' | 'dominio' | 'restriccion' | 'soporte';

export interface Technique {
  id: number;
  nombre: string;
  tipo: TechniqueType;
  efectividadProm: number;
  condicionesDeUso: string;
}
