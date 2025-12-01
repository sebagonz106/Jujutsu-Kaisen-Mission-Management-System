/**
 * @fileoverview Type definitions for sorcerer-in-charge (HechiceroEncargado).
 * Matches backend model `HechiceroEncargado`.
 * @module types/sorcererInCharge
 */

import type { Sorcerer } from './sorcerer';
import type { Request } from './request';

/** Represents a sorcerer-in-charge (HechiceroEncargado) entity. */
export interface SorcererInCharge {
  /** Unique identifier (backend `Id`). */
  id: number;
  /** Related sorcerer ID (backend `HechiceroId`). */
  hechiceroId: number;
  /** Related sorcerer object (backend `Hechicero`). */
  hechicero?: Sorcerer;
  /** Related request ID (backend `SolicitudId`). */
  solicitudId: number;
  /** Related request object (backend `Solicitud`). */
  solicitud?: Request;
  /** Related mission ID (backend `MisionId`). */
  misionId: number;
  /** Related mission object (backend `Mision`). */
  mision?: { id: number; startAt?: string };
}

/** Payload for creating/updating a sorcerer-in-charge. */
export interface SorcererInChargePayload {
  hechiceroId: number;
  solicitudId: number;
  misionId: number;
}
