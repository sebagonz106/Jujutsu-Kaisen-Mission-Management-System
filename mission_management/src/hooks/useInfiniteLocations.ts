/**
 * @fileoverview Infinite pagination hook for locations with server-side cursor-based paging.
 * @module hooks/useInfiniteLocations
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { locationApi } from '../api/locationApi';
import type { Location } from '../types/location';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching locations with infinite pagination.
 */
export const useInfiniteLocations = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<Location>>({
    queryKey: ['locations', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return locationApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    initialPageParam: undefined,
  });
};
