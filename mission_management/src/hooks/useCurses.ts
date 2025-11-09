/**
 * @fileoverview Custom React hook for managing curses with React Query.
 *
 * Provides CRUD operations (list, create, update, delete) for curses,
 * with automatic cache invalidation on mutations.
 *
 * @module hooks/useCurses
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { curseApi } from '../api/curseApi';
import type { Curse } from '../types/curse';

const KEY = ['curses'];

/**
 * Hook for managing curses.
 *
 * @returns Object containing:
 * - `list` - Query result for fetching all curses.
 * - `create` - Mutation for creating a new curse.
 * - `update` - Mutation for updating an existing curse.
 * - `remove` - Mutation for deleting a curse.
 *
 * @example
 * ```tsx
 * const { list, create, update, remove } = useCurses();
 *
 * if (list.isLoading) return <div>Loading...</div>;
 * if (list.isError) return <div>Error loading curses</div>;
 *
 * const curses = list.data;
 * ```
 */
export const useCurses = () => {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => curseApi.list() });
  const create = useMutation({
    mutationFn: (payload: Omit<Curse, 'id'>) => curseApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<Omit<Curse, 'id'>> }) => curseApi.update(vars.id, vars.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => curseApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
  return { list, create, update, remove };
};
