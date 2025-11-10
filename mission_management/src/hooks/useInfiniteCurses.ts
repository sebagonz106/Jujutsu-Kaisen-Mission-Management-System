/**
 * @fileoverview Infinite pagination hook for curses with server-side cursor-based paging.
 *
 * Provides infinite scrolling capabilities for curse lists using React Query's
 * `useInfiniteQuery` with normalized paged responses from the backend.
 *
 * @module hooks/useInfiniteCurses
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { curseApi } from '../api/curseApi';
import type { Curse } from '../types/curse';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook for fetching curses with infinite pagination.
 *
 * @param options - Configuration options for pagination.
 * @param options.pageSize - Number of curses per page (default: 20).
 * @returns Infinite query result for curses.
 *
 * @example
 * ```tsx
 * const { data, hasNextPage, fetchNextPage } = useInfiniteCurses({ pageSize: 20 });
 * const curses = data?.pages.flatMap((p) => p.items) ?? [];
 * ```
 */
export const useInfiniteCurses = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<Curse>>({
    queryKey: ['curses', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return curseApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => (lastPage.nextCursor ?? undefined),
    initialPageParam: undefined,
  });
};
