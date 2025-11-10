/**
 * @fileoverview Infinite pagination hook for missions with server-side cursor-based paging.
 *
 * Provides infinite scrolling capabilities for mission lists using React Query's
 * `useInfiniteQuery` with normalized paged responses from the backend.
 *
 * @module hooks/useInfiniteMissions
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { missionApi } from '../api/missionApi';
import type { Mission } from '../types/mission';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching missions with infinite pagination.
 *
 * @param options - Configuration options for pagination.
 * @param options.pageSize - Number of missions per page (default: 20).
 * @returns Infinite query result for missions.
 *
 * @example
 * ```tsx
 * const { data, hasNextPage, fetchNextPage } = useInfiniteMissions({ pageSize: 20 });
 * const missions = data?.pages.flatMap((p) => p.items) ?? [];
 * ```
 */
export const useInfiniteMissions = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<Mission>>({
    queryKey: ['missions', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return missionApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    initialPageParam: undefined,
  });
};
