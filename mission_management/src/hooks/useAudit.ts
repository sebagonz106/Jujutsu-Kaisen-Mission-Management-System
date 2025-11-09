/**
 * @fileoverview React Query hook to fetch recent audit entries with optional polling.
 */

import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/auditApi';
import type { AuditEntry } from '../types/audit';

const KEY = (limit?: number) => ['audit', limit ?? 50] as const;

export const useAudit = (options?: { limit?: number; refetchIntervalMs?: number }) => {
  const limit = options?.limit ?? 50;
  const refetchInterval = options?.refetchIntervalMs ?? 10_000;
  const list = useQuery<AuditEntry[]>({
    queryKey: KEY(limit),
    queryFn: () => auditApi.list(limit),
    refetchInterval,
  });
  return { list };
};
