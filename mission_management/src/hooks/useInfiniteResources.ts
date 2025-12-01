/**
 * @fileoverview Infinite pagination hook for resources with server-side cursor-based paging.
 * @module hooks/useInfiniteResources
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { resourceApi } from '../api/resourceApi';
import type { Resource } from '../types/resource';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching resources with infinite pagination.
 */
export const useInfiniteResources = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<Resource>>({
    queryKey: ['resources', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return resourceApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    initialPageParam: undefined,
  });
};
