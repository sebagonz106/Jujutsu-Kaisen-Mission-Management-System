/**
 * @fileoverview Infinite query hook for curses filtered by state.
 *
 * Provides paginated data fetching for the RF-12 query: "Curses by State".
 * Uses TanStack Query's useInfiniteQuery for cursor-based pagination.
 *
 * @module hooks/useInfiniteCursesByState
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { normalizePaged, type PagedResponse } from '../api/pagedApi';
import type { Curse, CurseState } from '../types/curse';

/**
 * Hook options for infinite curses by state query.
 */
interface UseInfiniteCursesByStateOptions {
  /** State filter for curses. */
  state: CurseState;
  
  /** Number of items per page. */
  pageSize: number;
}

/**
 * Custom hook for fetching curses filtered by state with infinite scrolling.
 *
 * @param options - Query options including state filter and page size.
 * @returns Object containing the infinite query result.
 *
 * @example
 * ```tsx
 * const { query } = useInfiniteCursesByState({ 
 *   state: 'activa', 
 *   pageSize: 20 
 * });
 * 
 * const curses = query.data?.pages.flatMap(p => p.items) ?? [];
 * ```
 */
export const useInfiniteCursesByState = (options: UseInfiniteCursesByStateOptions) => {
  const { state, pageSize } = options;

  const query = useInfiniteQuery({
    queryKey: ['curses', 'by-state', state, pageSize],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('state', state);
      params.set('limit', pageSize.toString());
      if (pageParam) params.set('cursor', String(pageParam));
      
      const res = await apiClient.get<unknown>(`/api/curses/by-state?${params}`);
      return normalizePaged<Curse>(res.data, { limit: pageSize });
    },
    initialPageParam: undefined as string | number | undefined,
    getNextPageParam: (lastPage: PagedResponse<Curse>) => 
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

  return { query };
};
