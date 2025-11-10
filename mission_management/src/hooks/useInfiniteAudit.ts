/**
 * @fileoverview Infinite pagination hook for audit log with cursor-based paging.
 *
 * Provides infinite scrolling/pagination capabilities for audit entries using
 * React Query's `useInfiniteQuery`. Supports:
 * - Cursor-based pagination (fetches older entries on each page)
 * - Automatic background refetching at configurable intervals
 * - Normalized paged responses via the `pagedApi` adapter
 *
 * @module hooks/useInfiniteAudit
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { auditApi } from '../api/auditApi';
import type { AuditEntry } from '../types/audit';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching audit log entries with infinite pagination.
 *
 * @param options - Configuration options for pagination and polling.
 * @param options.pageSize - Number of entries per page (default: 20).
 * @param options.refetchIntervalMs - Polling interval in milliseconds (default: 10,000).
 * @returns Object containing the infinite query result.
 *
 * @example
 * ```tsx
 * const { query } = useInfiniteAudit({ pageSize: 20, refetchIntervalMs: 10_000 });
 * const entries = query.data?.pages.flatMap((p) => p.items) ?? [];
 *
 * // Load more
 * if (query.hasNextPage) {
 *   await query.fetchNextPage();
 * }
 * ```
 */
export const useInfiniteAudit = (options?: { pageSize?: number; refetchIntervalMs?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  const refetchInterval = options?.refetchIntervalMs ?? 10_000;

  const query = useInfiniteQuery<PagedResponse<AuditEntry>, Error>({
    queryKey: ['audit', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return auditApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    refetchInterval,
    initialPageParam: undefined,
  });

  return { query };
};
