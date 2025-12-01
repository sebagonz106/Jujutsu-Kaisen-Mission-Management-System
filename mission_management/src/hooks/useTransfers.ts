/**
 * @fileoverview React Query hook for managing transfers (Traslados).
 * Provides list, create, update, remove operations with unified cache invalidation.
 * @module hooks/useTransfers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transferApi } from '../api/transferApi';
import type { TransferPayload } from '../types/transfer';

/** Query key for transfer-related queries. */
const KEY = ['transfers'];

/**
 * Custom React Query hook for transfer CRUD operations.
 */
export const useTransfers = () => {
  const qc = useQueryClient();

  const list = useQuery({ queryKey: KEY, queryFn: () => transferApi.list() });

  const invalidate = () => qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] });

  const create = useMutation({
    mutationFn: (payload: TransferPayload) => transferApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<TransferPayload> }) => transferApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => transferApi.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
};
