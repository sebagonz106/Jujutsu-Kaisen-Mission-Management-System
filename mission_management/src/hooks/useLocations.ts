/**
 * @fileoverview React Query hooks for locations (Ubicacion).
 * @module hooks/useLocations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationApi } from '../api/locationApi';
import type { Location } from '../types/location';

const KEY = ['locations'];

export const useLocations = () => {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => locationApi.list() });
  const create = useMutation({
    mutationFn: (payload: Omit<Location, 'id'>) => locationApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] }),
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<Omit<Location, 'id'>> }) => locationApi.update(vars.id, vars.patch),
    onSuccess: () => qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => locationApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] }),
  });
  return { list, create, update, remove };
};
