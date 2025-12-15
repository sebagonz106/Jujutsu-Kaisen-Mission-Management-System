/**
 * @fileoverview Custom React hook for managing subordinations with React Query.
 *
 * Provides CRUD operations (list, create, update, delete) for subordinations,
 * with automatic cache invalidation on mutations.
 *
 * @module hooks/useSubordinations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subordinationApi } from '../api/subordinationApi';
import type { Subordination } from '../types/subordination';

const KEY = ['subordinations'];

/**
 * Hook for managing subordinations with CRUD operations and cache management.
 */
export const useSubordinations = () => {
  const qc = useQueryClient();
  
  const list = useQuery({ 
    queryKey: KEY, 
    queryFn: () => subordinationApi.list() 
  });
  
  const create = useMutation({
    mutationFn: (payload: Omit<Subordination, 'id'>) => subordinationApi.create(payload),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0],
      }),
  });
  
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<Omit<Subordination, 'id'>> }) => 
      subordinationApi.update(vars.id, vars.patch),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0],
      }),
  });
  
  const remove = useMutation({
    mutationFn: (id: number) => subordinationApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0],
      }),
  });
  
  return { list, create, update, remove };
};
