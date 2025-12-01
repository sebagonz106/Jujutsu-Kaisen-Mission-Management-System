/**
 * @fileoverview React Query hook for managing resource usages (UsoDeRecurso).
 * Provides list, create, update, remove operations with unified cache invalidation.
 * @module hooks/useResourceUsages
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceUsageApi } from '../api/resourceUsageApi';
import type { ResourceUsagePayload } from '../types/resourceUsage';

/** Query key for resource usage-related queries. */
const KEY = ['resource-usages'];

/**
 * Custom React Query hook for resource usage CRUD operations.
 */
export const useResourceUsages = () => {
  const qc = useQueryClient();

  const list = useQuery({ queryKey: KEY, queryFn: () => resourceUsageApi.list() });

  const invalidate = () => qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] });

  const create = useMutation({
    mutationFn: (payload: ResourceUsagePayload) => resourceUsageApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<ResourceUsagePayload> }) => resourceUsageApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => resourceUsageApi.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
};
