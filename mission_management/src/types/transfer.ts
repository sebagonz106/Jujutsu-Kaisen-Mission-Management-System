/**
 * @fileoverview Type definitions for transfers (Traslados).
 * Matches backend model `Traslado`.
 * @module types/transfer
 */

import type { Location } from './location';
import type { Sorcerer } from './sorcerer';

/** Transfer status enum matching backend EEstadoTraslado */
export const TRANSFER_STATUS = {
  programado: 'programado',
  en_curso: 'en_curso',
  finalizado: 'finalizado',
} as const;

export type TransferStatus = typeof TRANSFER_STATUS[keyof typeof TRANSFER_STATUS];

/** Represents a transfer (traslado) entity. */
export interface Transfer {
  /** Unique identifier (backend `Id`). */
  id: number;
  /** Transfer date (backend `Fecha`). */
  fecha: string;
  /** Transfer status (backend `Estado`). */
  estado: TransferStatus;
  /** Transfer reason (backend `Motivo`). */
  motivo?: string;
  /** Origin location ID (backend `OrigenId`). */
  origenId: number;
  /** Origin location (backend `Origen`). */
  origen?: Location;
  /** Destination location ID (backend `DestinoId`). */
  destinoId: number;
  /** Destination location (backend `Destino`). */
  destino?: Location;
  /** Related mission ID (backend `MisionId`). */
  misionId: number;
  /** Related mission object (backend `Mision`). */
  mision?: { id: number; startAt?: string };
  /** Sorcerers assigned to this transfer (backend `Hechiceros`). */
  hechiceros: Sorcerer[];
}

/** Payload for creating/updating a transfer. */
export interface TransferPayload {
  fecha: string;
  estado: TransferStatus;
  motivo?: string;
  origenId: number;
  destinoId: number;
  misionId: number;
  /** IDs of sorcerers to assign to this transfer (backend `HechicerosIds`). */
  hechicerosIds?: number[];
}
