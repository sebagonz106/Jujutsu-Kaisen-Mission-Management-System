/**
 * @fileoverview Type definitions for requests/solicitudes.
 * Matches backend model `Solicitud` (Id, MaldicionId, Estado).
 * @module types/request
 */

/** Request status enum matching backend EEstadoSolicitud */
export type RequestStatus = 
  | 'pendiente'
  | 'atendiendose'
  | 'atendida';

/** Represents a request/solicitud for handling a curse. */
export interface Request {
  /** Unique identifier (backend `Id`). */
  id: number;
  /** Associated curse ID (backend `MaldicionId`). */
  maldicionId: number;
  /** Request status (backend `Estado`). */
  estado: RequestStatus;
}

/** Payload for creating a new request (id is server-assigned). */
export type NewRequest = Omit<Request, 'id'>;
