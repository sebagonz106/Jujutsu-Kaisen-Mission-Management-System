/**
 * @fileoverview Infinite pagination hook for requests with server-side cursor-based paging.
 * @module hooks/useInfiniteRequests
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { requestApi } from '../api/requestApi';
import type { Request } from '../types/request';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching requests with infinite pagination.
 */
export const useInfiniteRequests = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<Request>>({
    queryKey: ['requests', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return requestApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    initialPageParam: undefined,
  });
};
