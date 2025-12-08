/**
 * @fileoverview Infinite query hook for missions in date range (RF-13).
 *
 * Provides paginated data fetching for missions within a specified date range.
 * Uses TanStack Query's useInfiniteQuery for cursor-based pagination.
 *
 * @module hooks/useInfiniteMissionsInRange
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { normalizePaged, type PagedResponse } from '../api/pagedApi';
import type { MissionInRange } from '../types/missionInRange';

/**
 * Hook options for infinite missions in date range query.
 */
interface UseInfiniteMissionsInRangeOptions {
  /** Start date (ISO string). */
  startDate: string;
  
  /** End date (ISO string). */
  endDate: string;
  
  /** Number of items per page. */
  pageSize: number;
}

/**
 * Custom hook for fetching missions within a date range with infinite scrolling.
 *
 * @param options - Query options including date range and page size.
 * @returns Object containing the infinite query result.
 *
 * @example
 * ```tsx
 * const { query } = useInfiniteMissionsInRange({ 
 *   startDate: '2024-01-01', 
 *   endDate: '2024-12-31',
 *   pageSize: 20 
 * });
 * 
 * const missions = query.data?.pages.flatMap(p => p.items) ?? [];
 * ```
 */
export const useInfiniteMissionsInRange = (options: UseInfiniteMissionsInRangeOptions) => {
  const { startDate, endDate, pageSize } = options;

  const query = useInfiniteQuery({
    queryKey: ['missions', 'in-range', startDate, endDate, pageSize],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('startDate', startDate);
      params.set('endDate', endDate);
      params.set('limit', pageSize.toString());
      if (pageParam) params.set('cursor', String(pageParam));
      
      const res = await apiClient.get<unknown>(`/api/missions/in-range?${params}`);
      return normalizePaged<MissionInRange>(res.data, { limit: pageSize });
    },
    initialPageParam: undefined as string | number | undefined,
    getNextPageParam: (lastPage: PagedResponse<MissionInRange>) => 
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!startDate && !!endDate, // Only fetch if both dates are provided
  });

  return { query };
};
