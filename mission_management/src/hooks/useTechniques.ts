/**
 * @fileoverview React Query hooks for techniques (TecnicaMaldita).
 * @module hooks/useTechniques
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { techniqueApi } from '../api/techniqueApi';
import type { Technique } from '../types/technique';

const KEY = ['techniques'];

export const useTechniques = () => {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => techniqueApi.list() });
  const create = useMutation({
    mutationFn: (payload: Omit<Technique, 'id'>) => techniqueApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] }),
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<Omit<Technique, 'id'>> }) => techniqueApi.update(vars.id, vars.patch),
    onSuccess: () => qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => techniqueApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] }),
  });
  return { list, create, update, remove };
};
