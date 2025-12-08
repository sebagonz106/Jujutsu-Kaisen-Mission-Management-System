/**
 * @fileoverview Query hook for sorcerer statistics (RF-14).
 *
 * Provides data fetching for a specific sorcerer's statistical data.
 * Uses TanStack Query's useQuery for single sorcerer statistics.
 *
 * @module hooks/useSorcererStats
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { SorcererStats } from '../types/sorcererStats';

/**
 * Hook options for sorcerer statistics query.
 */
interface UseSorcererStatsOptions {
  /** Sorcerer ID to fetch statistics for. */
  sorcererId: number | null;
}

/**
 * Custom hook for fetching sorcerer statistics.
 *
 * @param options - Query options including sorcerer ID.
 * @returns Object containing the query result.
 *
 * @example
 * ```tsx
 * const { query } = useSorcererStats({ sorcererId: 5 });
 * 
 * const stats = query.data;
 * ```
 */
export const useSorcererStats = (options: UseSorcererStatsOptions) => {
  const { sorcererId } = options;

  const query = useQuery({
    queryKey: ['sorcerers', 'stats', sorcererId],
    queryFn: async () => {
      const res = await apiClient.get<SorcererStats>(`/api/sorcerers/${sorcererId}/stats`);
      return res.data;
    },
    enabled: sorcererId !== null && sorcererId > 0, // Only fetch if valid ID
  });

  return { query };
};
