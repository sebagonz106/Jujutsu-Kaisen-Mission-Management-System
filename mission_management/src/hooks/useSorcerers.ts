import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sorcererApi } from '../api/sorcererApi';
import type { Sorcerer } from '../types/sorcerer';

const KEY = ['sorcerers'];

export const useSorcerers = () => {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => sorcererApi.list() });
  const create = useMutation({
    mutationFn: (payload: Omit<Sorcerer, 'id'>) => sorcererApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<Omit<Sorcerer, 'id'>> }) => sorcererApi.update(vars.id, vars.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => sorcererApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
  return { list, create, update, remove };
};
