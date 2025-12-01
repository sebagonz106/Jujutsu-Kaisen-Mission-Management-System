/**
 * @fileoverview Type definitions for resources (Recursos).
 * Matches backend model `Recurso` (Id, Nombre, TipoRecurso, Descripcion, CantidadDisponible).
 * @module types/resource
 */

/** Resource type enum matching backend ETipoRecurso */
export type ResourceType = 
  | 'EquipamientoDeCombate'
  | 'Herramienta'
  | 'Transporte'
  | 'Suministros';

/** Represents a resource used in missions. */
export interface Resource {
  /** Unique identifier (backend `Id`). */
  id: number;
  /** Resource name (backend `Nombre`). */
  nombre: string;
  /** Resource type (backend `TipoRecurso`). */
  tipoRecurso: ResourceType;
  /** Optional description (backend `Descripcion`). */
  descripcion?: string;
  /** Available quantity (backend `CantidadDisponible`). */
  cantidadDisponible: number;
}

/** Payload for creating a new resource (id is server-assigned). */
export type NewResource = Omit<Resource, 'id'>;
