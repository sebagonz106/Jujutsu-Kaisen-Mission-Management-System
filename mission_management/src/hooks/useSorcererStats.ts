/**
 * @fileoverview Infinite pagination hook for sorcerer statistics.
 *
 * Provides infinite scrolling capabilities for the "Estadísticas de Hechiceros" query
 * using React Query's `useInfiniteQuery` with cursor-based pagination.
 * Returns effectiveness statistics for medium and high grade sorcerers.
 *
 * @module hooks/useSorcererStats
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { SorcererStats } from '../types/sorcererStats';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook options for sorcerer stats query.
 */
interface UseSorcererStatsOptions {
  /** Number of items per page (default: 20). */
  pageSize?: number;
  
  /** Whether to enable the query. */
  enabled?: boolean;
}

/**
 * Custom hook for fetching sorcerer statistics with infinite pagination.
 *
 * @param options - Query options.
 * @returns Infinite query result for sorcerer statistics.
 *
 * @example
 * ```tsx
 * const { data, hasNextPage, fetchNextPage } = useSorcererStats();
 * const stats = data?.pages.flatMap((p) => p.items) ?? [];
 * ```
 */
export const useSorcererStats = (options?: UseSorcererStatsOptions) => {
  const { pageSize = 20, enabled = true } = options ?? {};

  return useInfiniteQuery<PagedResponse<SorcererStats>>({
    queryKey: ['sorcerer-stats', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' ? pageParam : undefined;
      const params = new URLSearchParams();
      params.set('limit', pageSize.toString());
      if (cursor !== undefined) {
        params.set('cursor', cursor.toString());
      }
      // Backend expects: GET /api/EstadisticasHechicero?limit=X&cursor=Y
      const res = await apiClient.get<PagedResponse<SorcererStats>>(`/sorcerer-stats?${params}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled,
  });
};
