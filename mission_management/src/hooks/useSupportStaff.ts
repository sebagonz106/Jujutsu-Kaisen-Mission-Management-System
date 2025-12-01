/**
 * @fileoverview React Query hook for managing support staff (PersonalDeApoyo).
 * Provides list, create, update, remove operations with unified cache invalidation.
 * @module hooks/useSupportStaff
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportStaffApi } from '../api/supportStaffApi';
import type { NewSupportStaff } from '../types/supportStaff';

/** Query key for support staff-related queries. */
const KEY = ['support-staff'];

/**
 * Custom React Query hook for support staff CRUD operations.
 */
export const useSupportStaff = () => {
  const qc = useQueryClient();

  const list = useQuery({ queryKey: KEY, queryFn: () => supportStaffApi.list() });

  const invalidate = () => qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] });

  const create = useMutation({
    mutationFn: (payload: NewSupportStaff) => supportStaffApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<NewSupportStaff> }) => supportStaffApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => supportStaffApi.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
};
