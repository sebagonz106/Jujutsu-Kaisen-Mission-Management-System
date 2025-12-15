/**
 * @fileoverview Type definitions for subordination (master-disciple relationships).
 *
 * @module types/subordination
 */

/** Relationship type enum constants matching backend ETipoRelacion */
export const SUBORDINATION_TYPE = {
  tutoria: 'Tutoría',
  supervision: 'Supervisión',
  liderazgoEquipo: 'LiderazgoEquipo',
  entrenamiento: 'Entrenamiento',
} as const;

export type SubordinationType = (typeof SUBORDINATION_TYPE)[keyof typeof SUBORDINATION_TYPE];

/**
 * Subordination entity representing master-disciple relationships.
 */
export interface Subordination {
  id: number;
  maestroId: number;
  discipuloId: number;
  fechaInicio: string; // ISO date string
  fechaFin?: string | null;
  tipoRelacion: SubordinationType;
  activa: boolean;
  // Populated from backend (optional)
  maestro?: { id: number; name: string };
  discipulo?: { id: number; name: string };
}
