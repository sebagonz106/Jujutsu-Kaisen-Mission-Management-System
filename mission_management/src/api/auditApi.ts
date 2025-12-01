/**
 * @fileoverview API client for audit log entries.
 */

import { apiClient } from './client';
import { normalizePaged, type PagedResponse } from './pagedApi';
import type { AuditEntry } from '../types/audit';

export const auditApi = {
  /**
   * Fetches recent audit entries.
   * @param params Optional pagination params: { limit, offset }
   */
  async list(params?: { limit?: number; offset?: number }): Promise<PagedResponse<AuditEntry>> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.offset) qp.push(`offset=${encodeURIComponent(String(params.offset))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/audit${qs}`);
    return normalizePaged<AuditEntry>(data, { limit: params?.limit });
  },
};
