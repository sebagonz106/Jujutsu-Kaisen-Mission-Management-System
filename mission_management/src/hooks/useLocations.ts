/**
 * @fileoverview React Query hook for managing locations (Ubicaciones).
 * Provides list, create, update, remove operations with unified cache invalidation.
 * @module hooks/useLocations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationApi } from '../api/locationApi';
import type { NewLocation } from '../types/location';

/** Query key for location-related queries. Used for cache management and invalidation. */
const KEY = ['locations'];

/**
 * Custom React Query hook for location CRUD operations.
 * Provides queries and mutations with automatic cache invalidation.
 *
 * **Query (list)**:
 * - Fetches all locations (with optional pagination parameters in the underlying API)
 * - Cached under key `['locations']`
 * - Auto-refetches on window focus and mount (React Query defaults)
 *
 * **Mutations**:
 * - `create`: Creates a new location
 * - `update`: Updates an existing location (partial update)
 * - `remove`: Deletes a location
 * - All mutations automatically invalidate location queries on success
 *
 * **Cache Invalidation Strategy**:
 * Uses predicate-based invalidation to clear both base queries (`['locations']`)
 * and any derived queries (e.g., infinite pagination queries like `['locations', 'infinite', ...]`).
 *
 * @returns Object containing query and mutation handlers
 * @returns {UseQueryResult} list - Query for fetching locations list
 * @returns {UseMutationResult} create - Mutation for creating a location
 * @returns {UseMutationResult} update - Mutation for updating a location
 * @returns {UseMutationResult} remove - Mutation for deleting a location
 *
 * @example
 * ```typescript
 * function LocationsManager() {
 *   const { list, create, update, remove } = useLocations();
 *
 *   // Access query state
 *   if (list.isLoading) return <Spinner />;
 *   if (list.isError) return <Error message={list.error.message} />;
 *
 *   const locations = list.data?.items ?? [];
 *
 *   // Create new location
 *   const handleCreate = async () => {
 *     await create.mutateAsync({ nombre: 'New Location' });
 *     // Cache automatically invalidated and refetched
 *   };
 *
 *   // Update existing location
 *   const handleUpdate = async (id: number) => {
 *     await update.mutateAsync({ id, patch: { nombre: 'Updated Name' } });
 *   };
 *
 *   // Delete location
 *   const handleDelete = async (id: number) => {
 *     await remove.mutateAsync(id);
 *   };
 *
 *   return <LocationList locations={locations} />;
 * }
 * ```
 */
export const useLocations = () => {
  const qc = useQueryClient();

  /**
   * Query for fetching the locations list.
   * Returns paginated response normalized by locationApi.list().
   */
  const list = useQuery({ queryKey: KEY, queryFn: () => locationApi.list() });

  /**
   * Invalidates all location-related queries in the cache.
   * Uses predicate to match any query key starting with 'locations'.
   * This ensures both base and infinite pagination queries are cleared.
   */
  const invalidate = () => qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] });

  /**
   * Mutation for creating a new location.
   * Automatically invalidates location queries on success.
   */
  const create = useMutation({
    mutationFn: (payload: NewLocation) => locationApi.create(payload),
    onSuccess: invalidate,
  });

  /**
   * Mutation for updating an existing location.
   * Supports partial updates (only provided fields are updated).
   * Automatically invalidates location queries on success.
   */
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<NewLocation> }) => locationApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });

  /**
   * Mutation for deleting a location.
   * Automatically invalidates location queries on success.
   */
  const remove = useMutation({
    mutationFn: (id: number) => locationApi.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
};
