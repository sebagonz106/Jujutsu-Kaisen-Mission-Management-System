/**
 * @fileoverview Infinite pagination hook for support staff with server-side cursor-based paging.
 * @module hooks/useInfiniteSupportStaff
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { supportStaffApi } from '../api/supportStaffApi';
import type { SupportStaff } from '../types/supportStaff';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching support staff with infinite pagination.
 */
export const useInfiniteSupportStaff = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<SupportStaff>>({
    queryKey: ['support-staff', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return supportStaffApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    initialPageParam: undefined,
  });
};
