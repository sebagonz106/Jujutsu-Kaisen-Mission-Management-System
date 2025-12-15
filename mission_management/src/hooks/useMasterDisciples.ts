/**
 * @fileoverview Hook for fetching master-disciple relationships with pagination.
 *
 * Provides infinite scroll data fetching for master-disciple relations (Query6).
 * Uses TanStack Query's useInfiniteQuery for cursor-based pagination.
 *
 * @module hooks/useMasterDisciples
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Query6Result } from '../types/query6Result';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook options for master-disciple query.
 */
interface UseMasterDisciplesOptions {
  /** Page size (default: 20). */
  pageSize?: number;
  
  /** Whether to enable the query. */
  enabled?: boolean;
}

/**
 * Custom hook for fetching master-disciple relationships with infinite scroll.
 *
 * @param options - Query options including pagination settings.
 * @returns Object containing the infinite query result.
 *
 * @example
 * ```tsx
 * const { data, fetchNextPage, hasNextPage } = useMasterDisciples();
 * const relationships = data?.pages.flatMap((p) => p.items) ?? [];
 * ```
 */
export const useMasterDisciples = (options: UseMasterDisciplesOptions = {}) => {
  const { pageSize = 20, enabled = true } = options;

  return useInfiniteQuery<PagedResponse<Query6Result>>({
    queryKey: ['master-disciples', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' ? pageParam : undefined;
      const params = new URLSearchParams();
      params.set('limit', pageSize.toString());
      if (cursor !== undefined) {
        params.set('cursor', cursor.toString());
      }
      
      const res = await apiClient.get<PagedResponse<Query6Result>>(
        `/master-disciples?${params}`
      );
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled,
  });
};
