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
  /** ID of assigned sorcerer-in-charge (optional if not yet assigned). */
  hechiceroEncargadoId?: number;
  /** Urgency level for the mission (Planificada, Urgente, EmergenciaCritica). */
  nivelUrgencia?: string;
}

/** Payload for creating a new request (id is server-assigned). */
export type NewRequest = Omit<Request, 'id'>;
/**
 * Payload for updating a request with cascading logic.
 * 
 * Used when changing request state:
 * - `pendiente` → `atendiendose`: Requires hechiceroEncargadoId and nivelUrgencia (creates Mission + HechiceroEncargado)
 * - `atendiendose` → `atendiendose`: Optional hechiceroEncargadoId or nivelUrgencia (updates existing or changes priority)
 * - `atendiendose` → `atendida`: No additional fields needed
 */
export interface UpdateRequestPayload {
  /** New request status. */
  estado: RequestStatus;

  /** 
   * ID of the sorcerer to assign.
   * Required when transitioning to 'atendiendose' from 'pendiente'.
   * Optional when in 'atendiendose' to change the assigned sorcerer.
   */
  hechiceroEncargadoId?: number;

  /**
   * Urgency level for the associated mission.
   * Required when transitioning to 'atendiendose' from 'pendiente'.
   * Optional when in 'atendiendose' to change mission priority.
   */
  nivelUrgencia?: 'Planificada' | 'Urgente' | 'EmergenciaCritica';
}

/**
 * Response from backend when updating a request with cascading logic.
 * 
 * The response includes success status, a descriptive message,
 * and optional generatedData containing IDs of auto-created entities.
 */
export interface RequestUpdateResponse {
  /** Whether the update succeeded. */
  success: boolean;

  /** Human-readable message describing what happened. */
  message: string;

  /**
   * Data about auto-created or modified entities.
   * Present when cascading operations occur (e.g., Mission creation).
   */
  generatedData?: {
    /** ID of newly created Mission (when transitioning to 'atendiendose'). */
    misionId?: number;

    /** ID of HechiceroEncargado (new or updated). */
    hechiceroEncargadoId?: number;

    /** Updated urgency level (when changed). */
    nivelUrgencia?: string;
  };
}