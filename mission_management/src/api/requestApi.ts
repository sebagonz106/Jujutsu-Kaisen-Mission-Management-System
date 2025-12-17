/**
 * @fileoverview API client methods for request/solicitud CRUD operations.
 * Endpoint: `/requests` (translated to backend `/Solicitud` via api/client routeMap).
 * @module api/requestApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { Request, NewRequest, UpdateRequestPayload, RequestUpdateResponse } from '../types/request';

// Enum translation maps frontend <-> backend
const estadoToBackend: Record<Request['estado'], string> = {
  pendiente: 'pendiente',
  atendiendose: 'atendiendose',
  atendida: 'atendida',
};

const urgenciaToBackend: Record<'Planificada' | 'Urgente' | 'EmergenciaCritica', string> = {
  'Planificada': 'Planificada',
  'Urgente': 'Urgente',
  'EmergenciaCritica': 'EmergenciaCritica',
};

/**
 * Request/Solicitud API client with CRUD operations.
 */
export const requestApi = {
  /**
   * Fetches a paginated list of requests.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: Request[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/requests${qs}`);
    return normalizePaged<Request>(data, { limit: params?.limit });
  },

  /**
   * Fetches a single request by its ID.
   */
  async get(id: number): Promise<Request> {
    const { data } = await apiClient.get<Request>(`/requests/${id}`);
    return data;
  },

  /**
   * Fetches detailed information for a request including assigned sorcerer and urgency.
   */
  async getDetail(id: number): Promise<{ id: number; maldicionId: number; estado: string; hechiceroEncargadoId?: number; nivelUrgencia?: string }> {
    const { data } = await apiClient.get(`/requests/${id}/detail`);
    return data;
  },

  /**
   * Creates a new request.
   */
  async create(payload: NewRequest): Promise<Request> {
    const { data } = await apiClient.post<Request>('/requests', payload);
    return data;
  },

  /**
   * Updates an existing request with cascading logic support.
   * 
   * Handles automatic creation of Mission and HechiceroEncargado
   * when transitioning from 'pendiente' to 'atendiendose'.
   * 
   * Handles HechiceroEncargado changes and NivelUrgencia updates
   * when in 'atendiendose' state.
   * 
   * @param id - The request ID to update.
   * @param payload - Update payload with new estado, optional hechiceroEncargadoId, and optional nivelUrgencia.
   * @returns Promise resolving to response with success status, message, and optional generatedData containing auto-created entity IDs.
   */
  async update(id: number, payload: UpdateRequestPayload): Promise<RequestUpdateResponse> {
    try {
      // Convert frontend enum values to backend format
      // Filter out undefined and empty string values
      const send: any = {
        Estado: estadoToBackend[payload.estado],
      };
      
      if (payload.hechiceroEncargadoId !== undefined && payload.hechiceroEncargadoId !== null) {
        send.HechiceroEncargadoId = payload.hechiceroEncargadoId;
      }
      
      if (payload.nivelUrgencia && payload.nivelUrgencia.trim()) {
        send.NivelUrgencia = urgenciaToBackend[payload.nivelUrgencia as 'Planificada' | 'Urgente' | 'EmergenciaCritica'];
      }
      
      const { data } = await apiClient.put<RequestUpdateResponse>(`/requests/${id}`, send);
      
      // Validate response structure
      if (!data.success) {
        throw new Error(data.message || 'Failed to update request');
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error updating request');
    }
  },

  /**
   * Deletes a request by its ID.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/requests/${id}`);
  },
};
