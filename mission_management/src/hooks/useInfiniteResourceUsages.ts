/**
 * @fileoverview Infinite pagination hook for resource usages with server-side cursor-based paging.
 * @module hooks/useInfiniteResourceUsages
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { resourceUsageApi } from '../api/resourceUsageApi';
import type { ResourceUsage } from '../types/resourceUsage';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching resource usages with infinite pagination.
 */
export const useInfiniteResourceUsages = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<ResourceUsage>>({
    queryKey: ['resource-usages', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return resourceUsageApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    initialPageParam: undefined,
  });
};
