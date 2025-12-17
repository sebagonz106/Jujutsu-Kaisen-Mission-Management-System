/**
 * @fileoverview Custom React hook for managing missions with React Query.
 *
 * Provides CRUD operations (list, create, update, delete) for missions,
 * with automatic cache invalidation on mutations. Supports cascading logic:
 * mission state changes trigger automatic updates to related solicitudes and maldiciones.
 *
 * @module hooks/useMissions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missionApi } from '../api/missionApi';
import type { Mission, UpdateMissionPayload, MissionUpdateResponse } from '../types/mission';

const KEY = ['missions'];

/**
 * Hook for managing missions with CRUD operations and cache management.
 *
 * The update mutation invalidates related caches (missions, requests, curses)
 * when cascading operations occur, and stores generatedData for UI consumption.
 *
 * @returns Object containing:
 * - `list` - Query result for fetching all missions.
 * - `create` - Mutation for creating a new mission.
 * - `update` - Mutation for updating an existing mission with cascading support.
 * - `remove` - Mutation for deleting a mission.
 *
 * @example
 * ```tsx
 * const { list, create, update, remove } = useMissions();
 *
 * if (list.isLoading) return <div>Loading...</div>;
 * if (list.isError) return <div>Error loading missions</div>;
 *
 * const missions = Array.isArray(list.data) ? list.data : list.data?.items ?? [];
 * ```
 */
export const useMissions = () => {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => missionApi.list() });
  const create = useMutation({
    mutationFn: (payload: Omit<Mission, 'id'>) => missionApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: UpdateMissionPayload }) => missionApi.update(vars.id, vars.patch),
    onSuccess: (data: MissionUpdateResponse) => {
      // Invalidate specific query caches after cascading update
      // Using explicit queryKey calls prevents React Query from attempting unwanted GET requests
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['requests'] });
      qc.invalidateQueries({ queryKey: ['curses'] });
      
      // Store generated data for UI consumption (auto-created HechiceroEnMision records, etc.)
      qc.setQueryData(['lastUpdateResponse', 'mission'], data);
    },
  });
  const remove = useMutation({
    mutationFn: (id: number) => missionApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
  return { list, create, update, remove };
};
