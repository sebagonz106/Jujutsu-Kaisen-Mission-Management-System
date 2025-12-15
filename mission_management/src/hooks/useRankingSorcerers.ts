/**
 * @fileoverview Hook for fetching sorcerer ranking by level and location.
 *
 * Fetches the top 3 sorcerers per mission urgency level.
 * Uses TanStack Query's useQuery for simple data fetching.
 *
 * @module hooks/useRankingSorcerers
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { RankingHechicero } from '../types/rankingHechicero';

/**
 * Hook options for sorcerer ranking query.
 */
interface UseRankingSorcerersOptions {
  /** Location ID to filter rankings. */
  locationId: number;
  
  /** Whether to enable the query. */
  enabled?: boolean;
}

/**
 * Custom hook for fetching sorcerer rankings by level and location.
 * Returns top 3 sorcerers per mission urgency level at the specified location.
 *
 * @param options - Query options including location ID.
 * @returns Object containing the query result.
 *
 * @example
 * ```tsx
 * const { data: rankings, isLoading } = useRankingSorcerers({ locationId: 1 });
 * ```
 */
export const useRankingSorcerers = (options: UseRankingSorcerersOptions) => {
  const { locationId, enabled = true } = options;

  return useQuery<RankingHechicero[]>({
    queryKey: ['sorcerers', 'ranking', locationId],
    queryFn: async () => {
      const res = await apiClient.get<RankingHechicero[]>(
        `/sorcerer-ranking`,
        { params: { ubicacionId: locationId } }
      );
      return res.data;
    },
    enabled,
  });
};
