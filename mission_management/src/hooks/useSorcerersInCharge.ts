/**
 * @fileoverview React Query hook for managing sorcerers-in-charge (HechiceroEncargado).
 * Provides list, create, update, remove operations with unified cache invalidation.
 * @module hooks/useSorcerersInCharge
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sorcererInChargeApi } from '../api/sorcererInChargeApi';
import type { SorcererInChargePayload } from '../types/sorcererInCharge';

/** Query key for sorcerer-in-charge-related queries. */
const KEY = ['sorcerers-in-charge'];

/**
 * Custom React Query hook for sorcerer-in-charge CRUD operations.
 */
export const useSorcerersInCharge = () => {
  const qc = useQueryClient();

  const list = useQuery({ queryKey: KEY, queryFn: () => sorcererInChargeApi.list() });

  const invalidate = () => qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] });

  const create = useMutation({
    mutationFn: (payload: SorcererInChargePayload) => sorcererInChargeApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<SorcererInChargePayload> }) => sorcererInChargeApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => sorcererInChargeApi.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
};
