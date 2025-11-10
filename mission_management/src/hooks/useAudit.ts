/**
 * @fileoverview React Query hook for fetching recent audit entries with optional polling.
 *
 * This hook provides a simple query for fetching a fixed-size page of recent audit entries.
 * For infinite scrolling/pagination, use `useInfiniteAudit` instead.
 *
 * @module hooks/useAudit
 */

import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/auditApi';
import type { AuditEntry } from '../types/audit';

const KEY = (limit?: number) => ['audit', limit ?? 50] as const;

/**
 * Hook for fetching a fixed-size list of recent audit entries.
 *
 * @param options - Configuration options.
 * @param options.limit - Maximum number of entries to fetch (default: 50).
 * @param options.refetchIntervalMs - Polling interval in milliseconds (default: 10,000).
 * @returns Object containing the query result with `list` property.
 *
 * @example
 * ```tsx
 * const { list } = useAudit({ limit: 50, refetchIntervalMs: 10_000 });
 *
 * if (list.isLoading) return <Spinner />;
 * if (list.isError) return <ErrorMessage />;
 *
 * const entries = list.data ?? [];
 * ```
 */
export const useAudit = (options?: { limit?: number; refetchIntervalMs?: number }) => {
  const limit = options?.limit ?? 50;
  const refetchInterval = options?.refetchIntervalMs ?? 10_000;
  const list = useQuery<AuditEntry[]>({
    queryKey: KEY(limit),
    queryFn: async () => {
      const res = await auditApi.list({ limit });
      return res.items;
    },
    refetchInterval,
  });
  return { list };
};
