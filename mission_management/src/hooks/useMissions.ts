/**
 * @fileoverview Custom React hook for managing missions with React Query.
 *
 * Provides CRUD operations (list, create, update, delete) for missions,
 * with automatic cache invalidation on mutations. Mutations invalidate both
 * standard and infinite query caches to maintain consistency across the app.
 *
 * @module hooks/useMissions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missionApi } from '../api/missionApi';
import type { Mission } from '../types/mission';

const KEY = ['missions'];

/**
 * Hook for managing missions with CRUD operations and cache management.
 *
 * All mutations automatically invalidate both base and infinite query caches
 * for missions to ensure UI consistency.
 *
 * @returns Object containing:
 * - `list` - Query result for fetching all missions.
 * - `create` - Mutation for creating a new mission.
 * - `update` - Mutation for updating an existing mission.
 * - `remove` - Mutation for deleting a mission.
 *
 * @example
 * ```tsx
 * const { list, create, update, remove } = useMissions();
 *
 * if (list.isLoading) return <div>Loading...</div>;
 * if (list.isError) return <div>Error loading missions</div>;
 *
 * const missions = Array.isArray(list.data) ? list.data : list.data?.items ?? [];
 * ```
 */
export const useMissions = () => {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => missionApi.list() });
  const create = useMutation({
    mutationFn: (payload: Omit<Mission, 'id'>) => missionApi.create(payload),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0],
      }),
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<Omit<Mission, 'id'>> }) => missionApi.update(vars.id, vars.patch),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0],
      }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => missionApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0],
      }),
  });
  return { list, create, update, remove };
};
