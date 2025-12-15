/**
 * @fileoverview Hook for fetching missions of a specific sorcerer with pagination.
 *
 * Provides infinite scroll data fetching for missions by sorcerer (Query2).
 * Uses TanStack Query's useInfiniteQuery for cursor-based pagination.
 *
 * @module hooks/useSorcererMissions
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Query2Result } from '../types/query2Result';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook options for sorcerer missions query.
 */
interface UseSorcererMissionsOptions {
  /** Sorcerer ID. */
  sorcererId: number;
  
  /** Page size (default: 20). */
  pageSize?: number;
  
  /** Whether to enable the query. */
  enabled?: boolean;
}

/**
 * Custom hook for fetching missions of a specific sorcerer with infinite scroll.
 *
 * @param options - Query options including sorcerer ID.
 * @returns Object containing the infinite query result.
 *
 * @example
 * ```tsx
 * const { data, fetchNextPage, hasNextPage } = useSorcererMissions({ sorcererId: 1 });
 * const missions = data?.pages.flatMap((p) => p.items) ?? [];
 * ```
 */
export const useSorcererMissions = (options: UseSorcererMissionsOptions) => {
  const { sorcererId, pageSize = 20, enabled = true } = options;

  return useInfiniteQuery<PagedResponse<Query2Result>>({
    queryKey: ['sorcerer', 'missions', sorcererId, pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' ? pageParam : undefined;
      const params = new URLSearchParams();
      params.set('limit', pageSize.toString());
      if (cursor !== undefined) {
        params.set('cursor', cursor.toString());
      }
      
      const res = await apiClient.get<PagedResponse<Query2Result>>(
        `/sorcerer-missions/${sorcererId}?${params}`
      );
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: enabled && !!sorcererId,
  });
};
