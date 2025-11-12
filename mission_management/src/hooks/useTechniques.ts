/**
 * @fileoverview React Query hook for managing cursed techniques.
 * @module hooks/useTechniques
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { techniqueApi } from '../api/techniqueApi';
import type { NewTechnique, TechniquePatch } from '../types/technique';

const KEY = ['techniques'];

export const useTechniques = () => {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => techniqueApi.list() });
  const invalidate = () => qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] });

  const create = useMutation({
    mutationFn: (payload: NewTechnique) => techniqueApi.create(payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: TechniquePatch }) => techniqueApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number) => techniqueApi.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
};
