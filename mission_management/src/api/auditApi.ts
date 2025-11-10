/**
 * @fileoverview API client for audit log entries.
 */

import { apiClient } from './client';
import { normalizePaged, type PagedResponse } from './pagedApi';
import type { AuditEntry } from '../types/audit';

export const auditApi = {
  /**
   * Fetches recent audit entries.
   * @param params Optional pagination params: { limit, cursor } where cursor is the last id fetched (older entries will have id < cursor)
   */
  async list(params?: { limit?: number; cursor?: number | string }): Promise<PagedResponse<AuditEntry>> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${encodeURIComponent(String(params.limit))}`);
    if (params?.cursor) qp.push(`cursor=${encodeURIComponent(String(params.cursor))}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/audit${qs}`);
    return normalizePaged<AuditEntry>(data, { limit: params?.limit });
  },
};
