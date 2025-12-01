/**
 * @fileoverview Infinite pagination hook for transfers with server-side cursor-based paging.
 * @module hooks/useInfiniteTransfers
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { transferApi } from '../api/transferApi';
import type { Transfer } from '../types/transfer';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching transfers with infinite pagination.
 */
export const useInfiniteTransfers = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<Transfer>>({
    queryKey: ['transfers', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return transferApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    initialPageParam: undefined,
  });
};
