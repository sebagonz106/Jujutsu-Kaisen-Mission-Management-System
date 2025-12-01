/**
 * @fileoverview React Query hook for managing requests/solicitudes.
 * Provides list, create, update, remove operations with unified cache invalidation.
 * @module hooks/useRequests
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestApi } from '../api/requestApi';
import type { NewRequest } from '../types/request';

/** Query key for request-related queries. */
const KEY = ['requests'];

/**
 * Custom React Query hook for request CRUD operations.
 */
export const useRequests = () => {
  const qc = useQueryClient();

  const list = useQuery({ queryKey: KEY, queryFn: () => requestApi.list() });

  const invalidate = () => qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] });

  const create = useMutation({
    mutationFn: (payload: NewRequest) => requestApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<NewRequest> }) => requestApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => requestApi.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
};
