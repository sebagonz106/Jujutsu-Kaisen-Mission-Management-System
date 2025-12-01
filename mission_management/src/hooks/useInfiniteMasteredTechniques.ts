/**
 * @fileoverview Infinite pagination hook for mastered techniques with server-side cursor-based paging.
 * @module hooks/useInfiniteMasteredTechniques
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { masteredTechniqueApi } from '../api/masteredTechniqueApi';
import type { MasteredTechnique } from '../types/masteredTechnique';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching mastered techniques with infinite pagination.
 */
export const useInfiniteMasteredTechniques = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<MasteredTechnique>>({
    queryKey: ['mastered-techniques', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return masteredTechniqueApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    initialPageParam: undefined,
  });
};
