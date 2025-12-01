/**
 * @fileoverview Infinite pagination hook for techniques with server-side cursor-based paging.
 * @module hooks/useInfiniteTechniques
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { techniqueApi } from '../api/techniqueApi';
import type { Technique } from '../types/technique';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching techniques with infinite pagination.
 */
export const useInfiniteTechniques = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<Technique>>({
    queryKey: ['techniques', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return techniqueApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    initialPageParam: undefined,
  });
};
