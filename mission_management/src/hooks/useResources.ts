/**
 * @fileoverview React Query hook for managing resources (Recursos).
 * Provides list, create, update, remove operations with unified cache invalidation.
 * @module hooks/useResources
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceApi } from '../api/resourceApi';
import type { NewResource } from '../types/resource';

/** Query key for resource-related queries. */
const KEY = ['resources'];

/**
 * Custom React Query hook for resource CRUD operations.
 */
export const useResources = () => {
  const qc = useQueryClient();

  const list = useQuery({ queryKey: KEY, queryFn: () => resourceApi.list() });

  const invalidate = () => qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] });

  const create = useMutation({
    mutationFn: (payload: NewResource) => resourceApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<NewResource> }) => resourceApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => resourceApi.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
};
