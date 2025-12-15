/**
 * @fileoverview Hook for fetching technique effectiveness data with pagination.
 *
 * Provides infinite scroll data fetching for technique effectiveness statistics.
 * Uses TanStack Query's useInfiniteQuery for cursor-based pagination.
 *
 * @module hooks/useTechniqueEffectiveness
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Query4Result } from '../types/query4Result';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook options for technique effectiveness query.
 */
interface UseTechniqueEffectivenessOptions {
  /** Page size (default: 20). */
  pageSize?: number;

  /** Whether to enable the query. */
  enabled?: boolean;
}

/**
 * Custom hook for fetching technique effectiveness data with infinite scroll.
 *
 * @param options - Query options.
 * @returns Infinite query result for technique effectiveness.
 *
 * @example
 * ```tsx
 * const { data, hasNextPage, fetchNextPage } = useTechniqueEffectiveness();
 * const techniques = data?.pages.flatMap((p) => p.items) ?? [];
 * ```
 */
export const useTechniqueEffectiveness = (options?: UseTechniqueEffectivenessOptions) => {
  const { pageSize = 20, enabled = true } = options ?? {};

  return useInfiniteQuery<PagedResponse<Query4Result>>({
    queryKey: ['technique-effectiveness', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' ? pageParam : undefined;
      const params = new URLSearchParams();
      params.set('limit', pageSize.toString());
      if (cursor !== undefined) {
        params.set('cursor', cursor.toString());
      }

      const res = await apiClient.get<PagedResponse<Query4Result>>(
        `/technique-effectiveness?${params}`
      );
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled,
  });
};
