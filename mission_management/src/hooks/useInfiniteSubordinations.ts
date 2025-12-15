/**
 * @fileoverview Infinite pagination hook for subordinations.
 *
 * Provides infinite scrolling capabilities for subordinations list.
 *
 * @module hooks/useInfiniteSubordinations
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { subordinationApi } from '../api/subordinationApi';
import type { Subordination } from '../types/subordination';

interface UseInfiniteSubordinationsOptions {
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Custom hook for fetching subordinations with infinite scroll pagination.
 */
export const useInfiniteSubordinations = (options?: UseInfiniteSubordinationsOptions) => {
  const { pageSize = 20, enabled = true } = options ?? {};

  return useInfiniteQuery<{ items: Subordination[]; nextCursor?: number | string | null; hasMore?: boolean }>({
    queryKey: ['subordinations', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' || typeof pageParam === 'string' ? pageParam : undefined;
      return subordinationApi.list({ limit: pageSize, cursor: cursor ?? undefined });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as number | string | undefined,
    enabled,
  });
};
