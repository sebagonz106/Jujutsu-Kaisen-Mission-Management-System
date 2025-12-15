/**
 * @fileoverview Infinite pagination hook for curses filtered by state.
 *
 * Provides infinite scrolling capabilities for the "Maldiciones por Estado" query
 * using React Query's `useInfiniteQuery` with cursor-based pagination.
 *
 * @module hooks/useCursesByState
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { CurseByState } from '../types/curseByState';
import type { CurseState } from '../types/curse';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook options for curses by state query.
 */
interface UseCursesByStateOptions {
  /** State filter for curses. */
  state: CurseState;
  
  /** Number of items per page (default: 20). */
  pageSize?: number;
  
  /** Whether to enable the query. */
  enabled?: boolean;
}

/**
 * Custom hook for fetching curses filtered by state with infinite pagination.
 *
 * @param options - Query options including state filter.
 * @returns Infinite query result for curses by state.
 *
 * @example
 * ```tsx
 * const { data, hasNextPage, fetchNextPage } = useCursesByState({ state: 'activa' });
 * const curses = data?.pages.flatMap((p) => p.items) ?? [];
 * ```
 */
export const useCursesByState = (options: UseCursesByStateOptions) => {
  const { state, pageSize = 20, enabled = true } = options;

  return useInfiniteQuery<PagedResponse<CurseByState>>({
    queryKey: ['curses', 'by-state', state, pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' ? pageParam : undefined;
      const params = new URLSearchParams();
      params.set('limit', pageSize.toString());
      if (cursor !== undefined) {
        params.set('cursor', cursor.toString());
      }
      // Backend expects: GET /api/MaldicionConsulta/{estado}?limit=X&cursor=Y
      const res = await apiClient.get<PagedResponse<CurseByState>>(`/curse-queries/${state}?${params}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: enabled && !!state,
  });
};
