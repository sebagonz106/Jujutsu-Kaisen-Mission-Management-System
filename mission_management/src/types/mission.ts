/**
 * @fileoverview Type definitions for missions.
 *
 * Defines mission states, urgency levels, and the Mission entity interface.
 * Aligned with backend `Mision.cs` but adapted to frontend naming conventions.
 *
 * @module types/mission
 */

/**
 * Available mission states.
 */
export const MISSION_STATE = {
  pending: 'pending', // Pendiente
  in_progress: 'in_progress', // EnProgreso
  success: 'success', // CompletadaConExito
  failure: 'failure', // CompletadaConFracaso
  canceled: 'canceled', // Cancelada
} as const;

/**
 * Type for mission state.
 */
export type MissionState = typeof MISSION_STATE[keyof typeof MISSION_STATE];

/**
 * Available mission urgency levels.
 */
export const MISSION_URGENCY = {
  planned: 'planned', // Planificada
  urgent: 'urgent', // Urgente
  critical: 'critical', // EmergenciaCritica
} as const;

/**
 * Type for mission urgency.
 */
export type MissionUrgency = typeof MISSION_URGENCY[keyof typeof MISSION_URGENCY];

/**
 * Represents a mission entity.
 */
export interface Mission {
  /** Unique mission identifier. */
  id: number;

  /** Mission start date and time (ISO date string). */
  startAt: string;

  /** Mission end date and time (ISO date string, optional). */
  endAt?: string;

  /** Location identifier where the mission takes place. */
  locationId: number;

  /** Current mission state. */
  state: MissionState;

  /** Mission events log/description. */
  events: string;

  /** Collateral damage notes. */
  collateralDamage: string;

  /** Mission urgency level. */
  urgency: MissionUrgency;

  /** Array of sorcerer IDs assigned to this mission. */
  sorcererIds: number[];

  /** Array of curse IDs targeted by this mission. */
  curseIds: number[];
}
/**
 * Payload for updating a mission with cascading logic.
 * 
 * Used when changing mission state:
 * - `pending` → `in_progress`: Requires ubicacionId and hechicerosIds
 * - `in_progress` → `success` | `failure` | `canceled`: No additional fields
 */
export interface UpdateMissionPayload {
  /**
   * New mission state (translated from backend Spanish names).
   * 
   * Allowed transitions:
   * - 'pending' → 'in_progress'
   * - 'in_progress' → 'success' | 'failure' | 'canceled'
   */
  estado: Mission['state'];

  /**
   * Location ID where the mission takes place.
   * Required only when transitioning from 'pending' to 'in_progress'.
   */
  ubicacionId?: number;

  /**
   * Array of sorcerer IDs to assign to the mission.
   * Required only when transitioning from 'pending' to 'in_progress'.
   * Must contain at least one sorcerer ID.
   */
  hechicerosIds?: number[];
}

/**
 * Response from backend when updating a mission with cascading logic.
 * 
 * The response includes success status, a descriptive message,
 * and optional generatedData containing IDs of auto-created entities.
 */
export interface MissionUpdateResponse {
  /** Whether the update succeeded. */
  success: boolean;

  /** Human-readable message describing what happened and cascading effects. */
  message: string;

  /**
   * Data about auto-created or modified entities.
   * Present when cascading operations occur (e.g., HechiceroEnMision creation).
   */
  generatedData?: {
    /** ID of the updated mission. */
    misionId?: number;

    /** Array of IDs for newly created HechiceroEnMision records. */
    hechicerosEnMisionIds?: number[];

    /** Updated mission urgency level (when changed). */
    nivelUrgencia?: string;
  };
}