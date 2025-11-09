/**
 * @fileoverview API client for audit log entries.
 */

import { apiClient } from './client';
import type { AuditEntry } from '../types/audit';

export const auditApi = {
  /**
   * Fetches recent audit entries.
   * @param limit Optional number of entries to return (default 50).
   */
  async list(limit?: number): Promise<AuditEntry[]> {
    const { data } = await apiClient.get<AuditEntry[]>(`/audit${limit ? `?limit=${encodeURIComponent(String(limit))}` : ''}`);
    return data;
  },
};
