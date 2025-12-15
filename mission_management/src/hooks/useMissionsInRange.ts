/**
 * @fileoverview Infinite pagination hook for missions within a date range.
 *
 * Provides infinite scrolling capabilities for the "Misiones en Rango de Fechas" query
 * using React Query's `useInfiniteQuery` with cursor-based pagination.
 *
 * @module hooks/useMissionsInRange
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { MissionInRange } from '../types/missionInRange';
import type { PagedResponse } from '../api/pagedApi';

/**
 * Hook options for missions in range query.
 */
interface UseMissionsInRangeOptions {
  /** Start date (ISO string format: YYYY-MM-DD). */
  startDate: string;
  
  /** End date (ISO string format: YYYY-MM-DD). */
  endDate: string;
  
  /** Number of items per page (default: 20). */
  pageSize?: number;
  
  /** Whether to enable the query. */
  enabled?: boolean;
}

/**
 * Custom hook for fetching missions within a date range with infinite pagination.
 *
 * @param options - Query options including date range.
 * @returns Infinite query result for missions in range.
 *
 * @example
 * ```tsx
 * const { data, hasNextPage, fetchNextPage } = useMissionsInRange({ 
 *   startDate: '2024-01-01', 
 *   endDate: '2024-12-31' 
 * });
 * const missions = data?.pages.flatMap((p) => p.items) ?? [];
 * ```
 */
export const useMissionsInRange = (options: UseMissionsInRangeOptions) => {
  const { startDate, endDate, pageSize = 20, enabled = true } = options;

  return useInfiniteQuery<PagedResponse<MissionInRange>>({
    queryKey: ['missions', 'in-range', startDate, endDate, pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === 'number' ? pageParam : undefined;
      // Backend expects: GET /api/MisionesEnRango?desde={date}&hasta={date}&limit=X&cursor=Y
      const params = new URLSearchParams();
      params.set('desde', startDate);
      params.set('hasta', endDate);
      params.set('limit', pageSize.toString());
      if (cursor !== undefined) {
        params.set('cursor', cursor.toString());
      }
      
      const res = await apiClient.get<PagedResponse<MissionInRange>>(`/mission-range-queries?${params}`);
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: enabled && !!startDate && !!endDate,
  });
};
