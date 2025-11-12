/**
 * @fileoverview Cursed Techniques management page component.
 * Provides full CRUD interface for cursed techniques (Técnicas Malditas) with sortable table,
 * modal forms with effectiveness validation, and permission-based access control.
 * @module pages/techniques/TechniquesPage
 */

import { useMemo, useState } from 'react';
import { useTechniques } from '../../hooks/useTechniques';
import type { PagedResponse } from '../../api/pagedApi';
import type { Technique } from '../../types/technique';
import { TECHNIQUE_TYPE } from '../../types/technique';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
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
 * Zod validation schema for cursed technique form.
 * Validates:
 * - nombre: At least 2 characters
 * - tipo: Must be one of the valid technique types (amplificacion, dominio, restriccion, soporte)
 * - efectividadProm: Float between 0-100 (optional, defaults to 0)
 * - condicionesDeUso: String description of usage conditions (optional)
 */
const schema = z.object({
  nombre: z.string().min(2, t('form.validation.nameTooShort')),
  tipo: z.union([
    z.literal(TECHNIQUE_TYPE.amplificacion),
    z.literal(TECHNIQUE_TYPE.dominio),
    z.literal(TECHNIQUE_TYPE.restriccion),
    z.literal(TECHNIQUE_TYPE.soporte),
  ]),
  efectividadProm: z.coerce.number().min(0).max(100).optional(),
  condicionesDeUso: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/**
 * TechniquesPage component - Main UI for managing cursed techniques.
 *
 * **Features**:
 * - Displays techniques in a sortable table (ID, Nombre, Tipo, Efectividad, Condiciones)
 * - Create/Edit modal form with validation
 * - Effectiveness field with 0-100 range validation and step=0.1 precision
 * - Technique type dropdown (amplificacion, dominio, restriccion, soporte)
 * - Delete confirmation dialog
 * - Permission-based UI (mutation buttons hidden for unauthorized users)
 * - Loading states with skeletons
 * - Empty state when no techniques exist
 * - Toast notifications for success/error feedback
 *
 * **Validation Rules**:
 * - Nombre: minimum 2 characters
 * - Tipo: must be valid enum value
 * - EfectividadProm: 0-100 float (validated both client and server-side)
 * - Server returns 400 if efectividadProm out of range
 *
 * **Permission Model**:
 * - Support users: Full CRUD access
 * - High-rank sorcerers (alto, especial): Full CRUD access
 * - Low-rank sorcerers & observers: Read-only (buttons hidden, server returns 403)
 *
 * **State Management**:
 * - `editId`: ID of technique being edited (null for create mode)
 * - `showForm`: Controls modal visibility
 * - `deleteId`: ID of technique pending deletion
 * - `sortKey` & `sortDir`: Current table sort configuration
 *
 * @returns JSX.Element The rendered techniques management page
 *
 * @example
 * ```tsx
 * // Used in routing configuration
 * <Route path="/techniques" element={<TechniquesPage />} />
 * ```
 */
export const TechniquesPage = () => {
  const { list, create, update, remove } = useTechniques();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Technique>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', tipo: TECHNIQUE_TYPE.amplificacion, efectividadProm: 0, condicionesDeUso: 'ninguna' },
  });

  /**
   * Opens the create modal with empty form.
   * Resets form state with default values and sets editId to null for create mode.
   */
  const openCreate = () => {
    setEditId(null);
    reset({ nombre: '', tipo: TECHNIQUE_TYPE.amplificacion, efectividadProm: 0, condicionesDeUso: 'ninguna' });
    setShowForm(true);
  };

  /**
   * Opens the edit modal for an existing technique.
   * Populates form with current technique data.
   *
   * @param tq - The technique to edit
   */
  const startEdit = (tq: Technique) => {
    setEditId(tq.id);
    reset({ nombre: tq.nombre, tipo: tq.tipo, efectividadProm: tq.efectividadProm, condicionesDeUso: tq.condicionesDeUso });
    setShowForm(true);
  };

  /**
   * Handles form submission for both create and update operations.
   * Ensures efectividadProm defaults to 0 and condicionesDeUso defaults to 'ninguna' if not provided.
   * Shows success toast on completion or error toast on failure (e.g., validation errors from server).
   * Automatically closes modal after successful submission.
   */
  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = { nombre: values.nombre, tipo: values.tipo, efectividadProm: values.efectividadProm ?? 0, condicionesDeUso: values.condicionesDeUso ?? 'ninguna' };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success(t('toast.technique.updated'));
      } else {
        await create.mutateAsync(payload);
        toast.success(t('toast.technique.created'));
      }
      setShowForm(false);
    } catch {
      toast.error(t('toast.saveError'));
    }
  });

  /**
   * Confirms and executes technique deletion.
   * Shows success toast on completion or error toast on failure.
   * Clears deleteId state after operation.
   */
  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await remove.mutateAsync(deleteId);
        toast.success(t('toast.technique.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  /**
   * Memoized sorted techniques array.
   * Extracts items from paged response and applies current sort configuration.
   * Supports sorting by any Technique field in ascending or descending order.
   */
  const sortedData = useMemo(() => {
    const base: Technique[] = Array.isArray(list.data)
      ? list.data as Technique[]
      : (list.data as PagedResponse<Technique> | undefined)?.items ?? [];
    return [...base].sort((a,b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [list.data, sortKey, sortDir]);

  const toggleSort = (key: keyof Technique) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  if (list.isLoading) return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  );
  if (list.isError) return <div className="p-4 text-red-400">{t('errors.loadTechniques')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
  <h1 className="page-title">{t('pages.techniques.title')}</h1>
        {canMutate && <Button onClick={openCreate}>{t('ui.new_fem')}</Button>}
      </div>
      {sortedData.length === 0 ? (
        <EmptyState
          title={t('pages.techniques.emptyTitle')}
          description={canMutate ? t('pages.techniques.emptyDescHasPerms') : t('pages.techniques.emptyDescNoPerms')}
          action={canMutate ? <Button onClick={openCreate}>{t('pages.techniques.createAction')}</Button> : undefined}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label={t('ui.id')} active={sortKey==='id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label={t('form.labels.name')} active={sortKey==='nombre'} direction={sortDir} onClick={() => toggleSort('nombre')} /></TH>
                <TH><SortHeader label={t('form.labels.type')} active={sortKey==='tipo'} direction={sortDir} onClick={() => toggleSort('tipo')} /></TH>
                <TH><SortHeader label={'Efectividad'} active={sortKey==='efectividadProm'} direction={sortDir} onClick={() => toggleSort('efectividadProm')} /></TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((tech) => (
                <tr key={tech.id} className="border-b hover:bg-slate-800/40">
                  <TD>{tech.id}</TD>
                  <TD>{tech.nombre}</TD>
                  <TD>{tech.tipo}</TD>
                  <TD>{tech.efectividadProm}</TD>
                  {canMutate && (
                    <TD className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(tech)}>{t('ui.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(tech.id)} disabled={remove.isPending}>{t('ui.delete')}</Button>
                    </TD>
                  )}
                </tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}

      <Modal
        open={showForm && canMutate}
        onClose={() => setShowForm(false)}
  title={editId ? `${t('ui.edit')} ${t('pages.techniques.singular')}` : `${t('ui.new_fem')} ${t('pages.techniques.singular')}`}
        footer={<div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
          <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="technique-form">
            {editId ? t('ui.saveChanges') : t('ui.create')}
          </Button>
        </div>}
      >
        <form id="technique-form" onSubmit={onSubmit} className="space-y-3">
          <Input label={t('form.labels.name')} placeholder={t('form.labels.name')} {...register('nombre')} />
          {errors.nombre && <p className="text-xs text-red-400">{errors.nombre.message}</p>}
          <Select label={t('form.labels.type')} {...register('tipo')}>
            {Object.values(TECHNIQUE_TYPE).map(tp => <option key={tp} value={tp}>{tp}</option>)}
          </Select>
          <Input label={'Efectividad promedio'} type="number" {...register('efectividadProm', { valueAsNumber: true })} />
          {errors.efectividadProm && <p className="text-xs text-red-400">{errors.efectividadProm.message}</p>}
          <Input label={'Condiciones de uso'} placeholder={'Condiciones'} {...register('condicionesDeUso')} />
          {errors.condicionesDeUso && <p className="text-xs text-red-400">{errors.condicionesDeUso.message}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
  title={t('pages.techniques.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
