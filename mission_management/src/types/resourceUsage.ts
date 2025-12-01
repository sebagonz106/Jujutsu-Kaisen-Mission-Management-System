/**
 * @fileoverview Type definitions for resource usage (UsoDeRecurso).
 * Matches backend model `UsoDeRecurso`.
 * @module types/resourceUsage
 */

import type { Resource } from './resource';

/** Represents a resource usage (UsoDeRecurso) entity. */
export interface ResourceUsage {
  /** Unique identifier (backend `Id`). */
  id: number;
  /** Related mission ID (backend `MisionId`). */
  misionId: number;
  /** Related mission object (backend `Mision`). */
  mision?: { id: number; startAt?: string };
  /** Related resource ID (backend `RecursoId`). */
  recursoId: number;
  /** Related resource object (backend `Recurso`). */
  recurso?: Resource;
  /** Start date (backend `FechaInicio`). */
  fechaInicio: string;
  /** End date (backend `FechaFin`). */
  fechaFin?: string;
  /** Quantity used (backend `Cantidad`). */
  cantidad: number;
  /** Observations (backend `Observaciones`). */
  observaciones?: string;
}

/** Payload for creating/updating a resource usage. */
export interface ResourceUsagePayload {
  misionId: number;
  recursoId: number;
  fechaInicio: string;
  fechaFin?: string;
  cantidad: number;
  observaciones?: string;
}
