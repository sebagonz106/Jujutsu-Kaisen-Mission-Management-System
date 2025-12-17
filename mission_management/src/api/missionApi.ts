/**
 * @fileoverview API client methods for mission CRUD operations.
 *
 * Provides methods to interact with the `/missions` endpoint.
 *
 * @module api/missionApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Mission, UpdateMissionPayload, MissionUpdateResponse } from '../types/mission';

// Backend mission shape (PascalCase + enum names + navigation objects)
interface BackendMission {
  id: number;
  fechaYHoraDeInicio: string;
  fechaYHoraDeFin?: string | null;
  ubicacionId: number;
  estado: 'Pendiente' | 'EnProgreso' | 'CompletadaConExito' | 'CompletadaConFracaso' | 'Cancelada';
  eventosOcurridos: string;
  dannosColaterales: string;
  nivelUrgencia?: 'Planificada' | 'Urgente' | 'EmergenciaCritica';
  // Relations currently expressed via join tables; assumed backend will expose flattened arrays we map to sorcererIds/curseIds.
  hechiceros?: Array<{ hechiceroId: number }>; // if returned
  tecnicas?: Array<{ tecnicaMalditaId: number }>; // placeholder for curse mapping if needed
}

// Enum translation maps frontend <-> backend
const estadoToBackend: Record<Mission['state'], BackendMission['estado']> = {
  pending: 'Pendiente',
  in_progress: 'EnProgreso',
  success: 'CompletadaConExito',
  failure: 'CompletadaConFracaso',
  canceled: 'Cancelada',
};
const estadoFromBackend: Record<BackendMission['estado'], Mission['state']> = Object.fromEntries(
  Object.entries(estadoToBackend).map(([k, v]) => [v, k])
) as Record<BackendMission['estado'], Mission['state']>;

const urgenciaToBackend: Record<Mission['urgency'], NonNullable<BackendMission['nivelUrgencia']>> = {
  planned: 'Planificada',
  urgent: 'Urgente',
  critical: 'EmergenciaCritica',
};
const urgenciaFromBackend: Record<NonNullable<BackendMission['nivelUrgencia']>, Mission['urgency']> = Object.fromEntries(
  Object.entries(urgenciaToBackend).map(([k, v]) => [v, k])
) as Record<NonNullable<BackendMission['nivelUrgencia']>, Mission['urgency']>;

function normalizeMission(raw: BackendMission | Mission): Mission {
  // Accept both backend PascalCase and frontend mock camelCase shapes
  if (isBackendMission(raw)) {
    return {
      id: raw.id,
      startAt: raw.fechaYHoraDeInicio,
      endAt: raw.fechaYHoraDeFin ?? undefined,
      locationId: raw.ubicacionId,
      state: estadoFromBackend[raw.estado],
      events: raw.eventosOcurridos,
      collateralDamage: raw.dannosColaterales,
      urgency: raw.nivelUrgencia ? urgenciaFromBackend[raw.nivelUrgencia] : 'planned',
      sorcererIds: (raw.hechiceros ?? []).map(h => h.hechiceroId),
      curseIds: (raw.tecnicas ?? []).map(c => c.tecnicaMalditaId),
    };
  }
  return raw as Mission;
}

function isBackendMission(v: unknown): v is BackendMission {
  return typeof v === 'object' && v !== null && 'fechaYHoraDeInicio' in v && 'ubicacionId' in v && 'estado' in v;
}

/**
 * Mission API methods.
 */
export const missionApi = {
  /**
   * Fetches all missions.
   *
   * @returns Promise resolving to array of missions.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Mission[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/missions${qs}`);
    const norm = normalizePaged<BackendMission>(data, { limit: params?.limit });
    return { ...norm, items: norm.items.map(normalizeMission) };
  },

  /**
   * Fetches a single mission by ID.
   *
   * @param id - The mission ID.
   * @returns Promise resolving to the mission object.
   */
  async get(id: number): Promise<Mission> {
    const { data } = await apiClient.get<BackendMission>(`/missions/${id}`);
    return normalizeMission(data);
  },

  /**
   * Creates a new mission.
   *
   * @param payload - The mission data (without ID).
   * @returns Promise resolving to the created mission with assigned ID.
   */
  async create(payload: Omit<Mission, 'id'>): Promise<Mission> {
    const send: BackendMission = {
      id: 0,
      fechaYHoraDeInicio: payload.startAt,
      fechaYHoraDeFin: payload.endAt ?? null,
      ubicacionId: payload.locationId,
      estado: estadoToBackend[payload.state],
      eventosOcurridos: payload.events,
      dannosColaterales: payload.collateralDamage,
      nivelUrgencia: urgenciaToBackend[payload.urgency],
    };
    const { data } = await apiClient.post<BackendMission>('/missions', send);
    return normalizeMission(data);
  },

  /**
   * Updates an existing mission with cascading logic support.
   * 
   * Handles state transitions with validation:
   * - 'pending' → 'in_progress': requires ubicacionId and hechicerosIds
   * - 'in_progress' → 'success' | 'failure' | 'canceled': no additional fields needed
   * 
   * Automatically updates associated Solicitud and Maldicion states.
   *
   * @param id - The mission ID to update.
   * @param payload - Update payload with new estado and optional ubicacionId/hechicerosIds.
   * @returns Promise resolving to response with success status, message, and optional generatedData containing auto-created entity IDs.
   */
  async update(id: number, payload: UpdateMissionPayload): Promise<MissionUpdateResponse> {
    try {
      // Convert frontend Mission['state'] to backend Spanish enum values
      const send = {
        estado: estadoToBackend[payload.estado],
        ubicacionId: payload.ubicacionId,
        hechicerosIds: payload.hechicerosIds,
      };
      
      const { data } = await apiClient.put<MissionUpdateResponse>(`/missions/${id}`, send);
      
      // Validate response structure
      if (!data.success) {
        throw new Error(data.message || 'Failed to update mission');
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error updating mission');
    }
  },

  /**
   * Deletes a mission.
   *
   * @param id - The mission ID.
   * @returns Promise resolving when deletion is complete.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/missions/${id}`);
  },
};
