/**
 * @fileoverview Infinite pagination hook for sorcerers-in-charge with server-side cursor-based paging.
 * @module hooks/useInfiniteSorcerersInCharge
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { sorcererInChargeApi } from '../api/sorcererInChargeApi';
import type { SorcererInCharge } from '../types/sorcererInCharge';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching sorcerers-in-charge with infinite pagination.
 */
export const useInfiniteSorcerersInCharge = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<SorcererInCharge>>({
    queryKey: ['sorcerers-in-charge', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return sorcererInChargeApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    initialPageParam: undefined,
  });
};
