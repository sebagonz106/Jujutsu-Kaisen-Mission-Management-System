/**
 * @fileoverview Custom React hook for managing sorcerers with React Query.
 *
 * Provides CRUD operations (list, create, update, delete) for sorcerers,
 * with automatic cache invalidation on mutations. Mutations invalidate both
 * standard and infinite query caches to maintain consistency across the app.
 *
 * @module hooks/useSorcerers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sorcererApi } from '../api/sorcererApi';
import type { Sorcerer } from '../types/sorcerer';

const KEY = ['sorcerers'];

/**
 * Hook for managing sorcerers with CRUD operations and cache management.
 *
 * All mutations automatically invalidate both base and infinite query caches
 * for sorcerers to ensure UI consistency.
 *
 * @returns Object containing:
 * - `list` - Query result for fetching all sorcerers.
 * - `create` - Mutation for creating a new sorcerer.
 * - `update` - Mutation for updating an existing sorcerer.
 * - `remove` - Mutation for deleting a sorcerer.
 *
 * @example
 * ```tsx
 * const { list, create, update, remove } = useSorcerers();
 *
 * if (list.isLoading) return <div>Loading...</div>;
 * if (list.isError) return <div>Error loading sorcerers</div>;
 *
 * const sorcerers = Array.isArray(list.data) ? list.data : list.data?.items ?? [];
 *
 * // Create a new sorcerer
 * await create.mutateAsync({ name: 'Yuji Itadori', grado: 'medio', ... });
 * ```
 */
export const useSorcerers = () => {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => sorcererApi.list() });
  const create = useMutation({
    mutationFn: (payload: Omit<Sorcerer, 'id'>) => sorcererApi.create(payload),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0],
      }),
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<Omit<Sorcerer, 'id'>> }) => sorcererApi.update(vars.id, vars.patch),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0],
      }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => sorcererApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0],
      }),
  });
  return { list, create, update, remove };
};
