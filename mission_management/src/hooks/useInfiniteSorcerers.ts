/**
 * @fileoverview Infinite pagination hook for sorcerers with server-side cursor-based paging.
 *
 * Provides infinite scrolling capabilities for sorcerer lists using React Query's
 * `useInfiniteQuery` with normalized paged responses from the backend.
 *
 * @module hooks/useInfiniteSorcerers
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { sorcererApi } from '../api/sorcererApi';
import type { Sorcerer } from '../types/sorcerer';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching sorcerers with infinite pagination.
 *
 * @param options - Configuration options for pagination.
 * @param options.pageSize - Number of sorcerers per page (default: 20).
 * @returns Infinite query result for sorcerers.
 *
 * @example
 * ```tsx
 * const { data, hasNextPage, fetchNextPage } = useInfiniteSorcerers({ pageSize: 20 });
 * const sorcerers = data?.pages.flatMap((p) => p.items) ?? [];
 * ```
 */
export const useInfiniteSorcerers = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<Sorcerer>>({
    queryKey: ['sorcerers', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return sorcererApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    initialPageParam: undefined,
  });
};
