/**
 * @fileoverview Location management page component.
 * Provides full CRUD interface for mission locations (Ubicaciones) with sortable table,
 * modal forms, and permission-based access control.
 * @module pages/locations/LocationsPage
 */

import { useMemo, useState } from 'react';
import { useLocations } from '../../hooks/useLocations';
import { useInfiniteLocations } from '../../hooks/useInfiniteLocations';
import type { Location } from '../../types/location';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, THead, TBody, TH, TD, SortHeader } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { canMutate as canMutateByRole } from '../../utils/permissions';
import { t } from '../../i18n';

/**
 * Zod validation schema for location form.
 * Validates that location name is at least 2 characters.
 */
const schema = z.object({
  nombre: z.string().min(2, t('form.validation.nameTooShort')),
});

type FormValues = z.infer<typeof schema>;

/**
 * LocationsPage component - Main UI for managing mission locations.
 *
 * **Features**:
 * - Displays locations in a sortable table (ID, Nombre)
 * - Create/Edit modal form with validation
 * - Delete confirmation dialog
 * - Permission-based UI (mutation buttons hidden for unauthorized users)
 * - Loading states with skeletons
 * - Empty state when no locations exist
 * - Toast notifications for success/error feedback
 *
 * **Permission Model**:
 * - Support users: Full CRUD access
 * - High-rank sorcerers (alto, especial): Full CRUD access
 * - Low-rank sorcerers & observers: Read-only (buttons hidden, server returns 403)
 *
 * **State Management**:
 * - `editId`: ID of location being edited (null for create mode)
 * - `showForm`: Controls modal visibility
 * - `deleteId`: ID of location pending deletion
 * - `sortKey` & `sortDir`: Current table sort configuration
 *
 * @returns JSX.Element The rendered locations management page
 *
 * @example
 * ```tsx
 * // Used in routing configuration
 * <Route path="/locations" element={<LocationsPage />} />
 * ```
 */
export const LocationsPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteLocations({ pageSize: 20 });
  const { create, update, remove } = useLocations();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Location>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '' },
  });

  /**
   * Opens the create modal with empty form.
   * Resets form state and sets editId to null to indicate create mode.
   */
  const openCreate = () => {
    setEditId(null);
    reset({ nombre: '' });
    setShowForm(true);
  };

  /**
   * Opens the edit modal for an existing location.
   * Populates form with current location data.
   *
   * @param l - The location to edit
   */
  const startEdit = (l: Location) => {
    setEditId(l.id);
    reset({ nombre: l.nombre });
    setShowForm(true);
  };

  /**
   * Handles form submission for both create and update operations.
   * Shows success toast on completion or error toast on failure.
   * Automatically closes modal after successful submission.
   */
  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = { nombre: values.nombre };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
  toast.success(t('toast.location.updated'));
      } else {
        await create.mutateAsync(payload);
  toast.success(t('toast.location.created'));
      }
      setShowForm(false);
    } catch {
      toast.error(t('toast.saveError'));
    }
  });

  /**
   * Confirms and executes location deletion.
   * Shows success toast on completion or error toast on failure.
   * Clears deleteId state after operation.
   */
  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await remove.mutateAsync(deleteId);
  toast.success(t('toast.location.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  /**
   * Memoized sorted locations array.
   * Extracts items from paged response and applies current sort configuration.
   * Supports sorting by any Location field (id, nombre) in ascending or descending order.
   */
  const sortedData = useMemo(() => {
    const base: Location[] = data?.pages.flatMap((p) => p.items) ?? [];
    return [...base].sort((a,b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sortKey, sortDir]);

  /**
   * Toggles sort direction or changes sort column.
   * If clicking the same column, toggles asc/desc.
   * If clicking a new column, sorts by that column in ascending order.
   *
   * @param key - The location field to sort by
   */
  const toggleSort = (key: keyof Location) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  if (isLoading) return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  );
  if (isError) return <div className="p-4 text-red-400">{t('errors.loadLocations')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
  <h1 className="page-title">{t('pages.locations.title')}</h1>
        {canMutate && <Button onClick={openCreate}>{t('ui.new_fem')}</Button>}
      </div>
      {sortedData.length === 0 ? (
        <EmptyState
          title={t('pages.locations.emptyTitle')}
          description={canMutate ? t('pages.locations.emptyDescHasPerms') : t('pages.locations.emptyDescNoPerms')}
          action={canMutate ? <Button onClick={openCreate}>{t('pages.locations.createAction')}</Button> : undefined}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label={t('form.labels.name')} active={sortKey==='nombre'} direction={sortDir} onClick={() => toggleSort('nombre')} /></TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((l) => (
                <tr key={l.id} className="border-b hover:bg-slate-800/40">
                  <TD>{l.nombre}</TD>
                  {canMutate && (
                    <TD className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(l)}>{t('ui.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(l.id)} disabled={remove.isPending}>{t('ui.delete')}</Button>
                    </TD>
                  )}
                </tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}
      {sortedData.length > 0 && hasNextPage && (
        <div className="pt-3">
          <Button
            variant="secondary"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? t('ui.loadingMore') : t('ui.loadMore')}
          </Button>
        </div>
      )}

      <Modal
        open={showForm && canMutate}
        onClose={() => setShowForm(false)}
  title={editId ? `${t('ui.edit')} ${t('pages.locations.singular')}` : `${t('ui.new_fem')} ${t('pages.locations.singular')}`}
        footer={<div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
          <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="location-form">
            {editId ? t('ui.saveChanges') : t('ui.create')}
          </Button>
        </div>}
      >
        <form id="location-form" onSubmit={onSubmit} className="space-y-3">
          <Input label={t('form.labels.name')} placeholder={t('form.labels.name')} {...register('nombre')} />
          {errors.nombre && <p className="text-xs text-red-400">{errors.nombre.message}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
  title={t('pages.locations.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
