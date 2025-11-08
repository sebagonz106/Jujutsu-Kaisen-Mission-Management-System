import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missionApi } from '../api/missionApi';
import type { Mission } from '../types/mission';

const KEY = ['missions'];

export const useMissions = () => {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => missionApi.list() });
  const create = useMutation({
    mutationFn: (payload: Omit<Mission, 'id'>) => missionApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<Omit<Mission, 'id'>> }) => missionApi.update(vars.id, vars.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => missionApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
  return { list, create, update, remove };
};
