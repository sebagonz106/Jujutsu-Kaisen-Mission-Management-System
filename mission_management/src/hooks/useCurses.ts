import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { curseApi } from '../api/curseApi';
import type { Curse } from '../types/curse';

const KEY = ['curses'];

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
