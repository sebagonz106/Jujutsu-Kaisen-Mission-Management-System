/**
 * @fileoverview React Query hook for managing requests/solicitudes.
 * Provides list, create, update, remove operations with unified cache invalidation.
 * Supports cascading logic: request state changes trigger automatic mission/hechicero creation.
 * @module hooks/useRequests
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestApi } from '../api/requestApi';
import type { NewRequest, UpdateRequestPayload, RequestUpdateResponse } from '../types/request';

/** Query key for request-related queries. */
const KEY = ['requests'];

/**
 * Custom React Query hook for request CRUD operations with cascading support.
 * 
 * The update mutation invalidates related caches (requests, missions, sorcerers-in-charge)
 * when cascading operations occur, and stores generatedData for UI consumption.
 */
export const useRequests = () => {
  const qc = useQueryClient();

  const list = useQuery({ queryKey: KEY, queryFn: () => requestApi.list() });

  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (payload: NewRequest) => requestApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (vars: { id: number; payload: UpdateRequestPayload }) => requestApi.update(vars.id, vars.payload),
    onSuccess: (data: RequestUpdateResponse) => {
      // Invalidate the requests list cache after cascading update
      qc.invalidateQueries({ queryKey: KEY });
      
      // Also invalidate related entity caches
      qc.invalidateQueries({ queryKey: ['missions'] });
      qc.invalidateQueries({ queryKey: ['sorcerers-in-charge'] });
      
      // Store generated data for UI consumption (auto-created Mission, HechiceroEncargado, etc.)
      qc.setQueryData(['lastUpdateResponse', 'request'], data);
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => requestApi.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
};
