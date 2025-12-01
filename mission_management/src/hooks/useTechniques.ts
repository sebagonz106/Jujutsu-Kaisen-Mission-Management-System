/**
 * @fileoverview React Query hook for managing cursed techniques.
 * Provides list, create, update, remove operations with unified cache invalidation.
 * @module hooks/useTechniques
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { techniqueApi } from '../api/techniqueApi';
import type { NewTechnique, TechniquePatch } from '../types/technique';

/** Query key for technique-related queries. Used for cache management and invalidation. */
const KEY = ['techniques'];

/**
 * Custom React Query hook for cursed technique CRUD operations.
 * Provides queries and mutations with automatic cache invalidation.
 *
 * **Query (list)**:
 * - Fetches all cursed techniques (with optional pagination parameters in the underlying API)
 * - Cached under key `['techniques']`
 * - Auto-refetches on window focus and mount (React Query defaults)
 *
 * **Mutations**:
 * - `create`: Creates a new technique
 * - `update`: Updates an existing technique (partial update)
 * - `remove`: Deletes a technique
 * - All mutations automatically invalidate technique queries on success
 *
 * **Cache Invalidation Strategy**:
 * Uses predicate-based invalidation to clear both base queries (`['techniques']`)
 * and any derived queries (e.g., infinite pagination queries like `['techniques', 'infinite', ...]`).
 *
 * @returns Object containing query and mutation handlers
 * @returns {UseQueryResult} list - Query for fetching techniques list
 * @returns {UseMutationResult} create - Mutation for creating a technique
 * @returns {UseMutationResult} update - Mutation for updating a technique
 * @returns {UseMutationResult} remove - Mutation for deleting a technique
 *
 * @example
 * ```typescript
 * function TechniquesManager() {
 *   const { list, create, update, remove } = useTechniques();
 *
 *   // Access query state
 *   if (list.isLoading) return <Spinner />;
 *   if (list.isError) return <Error message={list.error.message} />;
 *
 *   const techniques = list.data?.items ?? [];
 *
 *   // Create new technique
 *   const handleCreate = async () => {
 *     await create.mutateAsync({
 *       nombre: 'Limitless',
 *       tipo: 'dominio',
 *       efectividadProm: 95.5,
 *       condicionesDeUso: 'Requires Six Eyes'
 *     });
 *     // Cache automatically invalidated and refetched
 *   };
 *
 *   // Update existing technique
 *   const handleUpdate = async (id: number) => {
 *     await update.mutateAsync({
 *       id,
 *       patch: { efectividadProm: 98.0 }
 *     });
 *   };
 *
 *   // Delete technique
 *   const handleDelete = async (id: number) => {
 *     await remove.mutateAsync(id);
 *   };
 *
 *   return <TechniqueList techniques={techniques} />;
 * }
 * ```
 */
export const useTechniques = () => {
  const qc = useQueryClient();

  /**
   * Query for fetching the techniques list.
   * Returns paginated response normalized by techniqueApi.list().
   */
  const list = useQuery({ queryKey: KEY, queryFn: () => techniqueApi.list() });

  /**
   * Invalidates all technique-related queries in the cache.
   * Uses predicate to match any query key starting with 'techniques'.
   * This ensures both base and infinite pagination queries are cleared.
   */
  const invalidate = () => qc.invalidateQueries({ predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0] });

  /**
   * Mutation for creating a new cursed technique.
   * Automatically invalidates technique queries on success.
   */
  const create = useMutation({
    mutationFn: (payload: NewTechnique) => techniqueApi.create(payload),
    onSuccess: invalidate,
  });

  /**
   * Mutation for updating an existing cursed technique.
   * Supports partial updates (only provided fields are updated).
   * Automatically invalidates technique queries on success.
   */
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: TechniquePatch }) => techniqueApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });

  /**
   * Mutation for deleting a cursed technique.
   * Automatically invalidates technique queries on success.
   */
  const remove = useMutation({
    mutationFn: (id: number) => techniqueApi.remove(id),
    onSuccess: invalidate,
  });

  return { list, create, update, remove };
};
