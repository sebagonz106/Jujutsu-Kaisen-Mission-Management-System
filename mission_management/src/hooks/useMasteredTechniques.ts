/**
 * @fileoverview React Query hook for managing mastered techniques (TecnicaMalditaDominada).
 * Provides list, create, update, remove operations with unified cache invalidation.
 * @module hooks/useMasteredTechniques
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { masteredTechniqueApi } from '../api/masteredTechniqueApi';
import type { MasteredTechniquePayload } from '../types/masteredTechnique';

/** Query key for mastered technique-related queries. */
const KEY = ['mastered-techniques'];

/**
 * Custom React Query hook for mastered technique CRUD operations.
 */
export const useMasteredTechniques = () => {
  const qc = useQueryClient();

  const list = useQuery({ queryKey: KEY, queryFn: () => masteredTechniqueApi.list() });

  const invalidate = () => qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] });

  const create = useMutation({
    mutationFn: (payload: MasteredTechniquePayload) => masteredTechniqueApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<MasteredTechniquePayload> }) => masteredTechniqueApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => masteredTechniqueApi.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
};
