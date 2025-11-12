/**
 * @fileoverview React Query hook for managing locations (Ubicaciones).
 * Provides list, create, update, remove operations with unified cache invalidation.
 * @module hooks/useLocations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationApi } from '../api/locationApi';
import type { NewLocation } from '../types/location';

const KEY = ['locations'];

export const useLocations = () => {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => locationApi.list() });
  const invalidate = () => qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] });

  const create = useMutation({
    mutationFn: (payload: NewLocation) => locationApi.create(payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<NewLocation> }) => locationApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number) => locationApi.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
};
