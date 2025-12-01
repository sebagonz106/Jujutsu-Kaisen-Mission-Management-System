/**
 * @fileoverview Type definitions for cursed techniques.
 * Mirrors backend `TecnicaMaldita` entity (Id, Nombre, Tipo, EfectividadProm, CondicionesDeUso).
 * @module types/technique
 */

/** Available cursed technique types (backend enum ETipoTecnica). */
export const TECHNIQUE_TYPE = {
  amplificacion: 'amplificacion',
  dominio: 'dominio',
  restriccion: 'restriccion',
  soporte: 'soporte',
} as const;

/** Type for technique kind. */
export type TechniqueType = typeof TECHNIQUE_TYPE[keyof typeof TECHNIQUE_TYPE];

/** Represents a cursed technique. */
export interface Technique {
  /** Unique identifier. */
  id: number;
  /** Public name. */
  nombre: string;
  /** Technique typology. */
  tipo: TechniqueType;
  /** Average effectiveness (0..100 or business-defined scale). */
  efectividadProm: number;
  /** Usage constraints / conditions. */
  condicionesDeUso: string;
}

/** Payload to create a new technique. */
export type NewTechnique = Omit<Technique, 'id'>;

/** Partial patch allowed when updating a technique. */
export type TechniquePatch = Partial<NewTechnique>;
