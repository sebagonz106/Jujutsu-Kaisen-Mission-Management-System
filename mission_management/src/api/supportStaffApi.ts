/**
 * @fileoverview API client methods for support staff CRUD operations.
 * Endpoint: `/support-staff` (translated to backend `/PersonalDeApoyo` via api/client routeMap).
 * @module api/supportStaffApi
 */

import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { SupportStaff, NewSupportStaff } from '../types/supportStaff';

/**
 * Support Staff API client with CRUD operations.
 */
export const supportStaffApi = {
  /**
   * Fetches a paginated list of support staff.
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ items: SupportStaff[]; nextCursor?: number | string | null; hasMore?: boolean }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/support-staff${qs}`);
    return normalizePaged<SupportStaff>(data, { limit: params?.limit });
  },

  /**
   * Fetches a single support staff by its ID.
   */
  async get(id: number): Promise<SupportStaff> {
    const { data } = await apiClient.get<SupportStaff>(`/support-staff/${id}`);
    return data;
  },

  /**
   * Creates a new support staff member.
   */
  async create(payload: NewSupportStaff): Promise<SupportStaff> {
    const { data } = await apiClient.post<SupportStaff>('/support-staff', payload);
    return data;
  },

  /**
   * Updates an existing support staff member.
   */
  async update(id: number, payload: Partial<NewSupportStaff>): Promise<SupportStaff> {
    const { data } = await apiClient.put<SupportStaff>(`/support-staff/${id}`, payload);
    return data;
  },

  /**
   * Deletes a support staff member by its ID.
   */
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/support-staff/${id}`);
  },
};
