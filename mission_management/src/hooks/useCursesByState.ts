/**
 * @fileoverview Hook for curses filtered by state.
 *
 * Provides data fetching for the "Maldiciones por Estado" query.
 *
 * @module hooks/useCursesByState
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { CurseByState } from '../types/curseByState';
import type { CurseState } from '../types/curse';

/**
 * Hook options for curses by state query.
 */
interface UseCursesByStateOptions {
  /** State filter for curses. */
  state: CurseState;
  
  /** Whether to enable the query. */
  enabled?: boolean;
}

/**
 * Custom hook for fetching curses filtered by state.
 *
 * @param options - Query options including state filter.
 * @returns Query result with curses data as array.
 *
 * @example
 * ```tsx
 * const { query } = useCursesByState({ state: 'activa' });
 * const curses = query.data ?? [];
 * ```
 */
export const useCursesByState = (options: UseCursesByStateOptions) => {
  const { state, enabled = true } = options;

  const query = useQuery<CurseByState[]>({
    queryKey: ['curses', 'by-state', state],
    queryFn: async () => {
      // Backend expects: GET /api/MaldicionConsulta/{estado}
      const res = await apiClient.get<CurseByState[]>(`/curse-queries/${state}`);
      return res.data;
    },
    enabled: enabled && !!state,
  });

  return { query };
};
