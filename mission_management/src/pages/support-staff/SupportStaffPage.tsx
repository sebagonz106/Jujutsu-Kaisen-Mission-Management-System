/**
 * @fileoverview Support Staff management page component.
 * Provides full CRUD interface for support staff (PersonalDeApoyo) with sortable table,
 * modal forms, and permission-based access control.
 * @module pages/support-staff/SupportStaffPage
 */

import { useMemo, useState } from 'react';
import { useInfiniteSupportStaff } from '../../hooks/useInfiniteSupportStaff';
import { useSupportStaff } from '../../hooks/useSupportStaff';
import type { PagedResponse } from '../../api/pagedApi';
import type { SupportStaff, StaffStatus } from '../../types/supportStaff';
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
import { getSorcererStatusLabel } from '../../utils/enumLabels';

const STAFF_STATUSES: StaffStatus[] = ['activo', 'lesionado', 'recuperandose', 'baja', 'inactivo'];

const schema = z.object({
  name: z.string().min(2, t('form.validation.nameTooShort')),
  estado: z.enum(['activo', 'lesionado', 'recuperandose', 'baja', 'inactivo']),
});

type FormValues = z.infer<typeof schema>;

export const SupportStaffPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteSupportStaff({ pageSize: 20 });
  const { list, create, update, remove } = useSupportStaff();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof SupportStaff>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', estado: 'activo' },
  });

  const openCreate = () => {
    setEditId(null);
    reset({ name: '', estado: 'activo' });
    setShowForm(true);
  };

  const startEdit = (s: SupportStaff) => {
    setEditId(s.id);
    reset({ name: s.name, estado: s.estado });
    setShowForm(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        name: values.name,
        estado: values.estado,
      };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success(t('toast.supportStaff.updated'));
      } else {
        await create.mutateAsync(payload);
        toast.success(t('toast.supportStaff.created'));
      }
      setShowForm(false);
    } catch {
      toast.error(t('toast.saveError'));
    }
  });

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await remove.mutateAsync(deleteId);
        toast.success(t('toast.supportStaff.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  const flat = useMemo(() => (data?.pages ?? []).flatMap((p) => p.items), [data]);
  const sortedData = useMemo(() => {
    const base: SupportStaff[] = flat.length
      ? flat
      : Array.isArray(list.data)
        ? list.data
        : (list.data as PagedResponse<SupportStaff> | undefined)?.items ?? [];
    return [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [flat, list.data, sortKey, sortDir]);

  const toggleSort = (key: keyof SupportStaff) => {
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
  if (isError) return <div className="p-4 text-red-400">{t('errors.loadSupportStaff')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('pages.supportStaff.title')}</h1>
        {canMutate && <Button onClick={openCreate}>{t('ui.new_masc')}</Button>}
      </div>
      {sortedData.length === 0 ? (
        <EmptyState
          title={t('pages.supportStaff.emptyTitle')}
          description={canMutate ? t('pages.supportStaff.emptyDescHasPerms') : t('pages.supportStaff.emptyDescNoPerms')}
          action={canMutate ? <Button onClick={openCreate}>{t('pages.supportStaff.createAction')}</Button> : undefined}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label={t('form.labels.name')} active={sortKey==='name'} direction={sortDir} onClick={() => toggleSort('name')} /></TH>
                <TH><SortHeader label={t('form.labels.state')} active={sortKey==='estado'} direction={sortDir} onClick={() => toggleSort('estado')} /></TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((s) => (
                <tr key={s.id} className="border-b hover:bg-slate-800/40">
                  <TD>{s.name}</TD>
                  <TD>{getSorcererStatusLabel(s.estado)}</TD>
                  {canMutate && (
                    <TD className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(s)}>{t('ui.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(s.id)} disabled={remove.isPending}>{t('ui.delete')}</Button>
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
        title={editId ? `${t('ui.edit')} ${t('pages.supportStaff.singular')}` : `${t('ui.new_masc')} ${t('pages.supportStaff.singular')}`}
        footer={<div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
          <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="support-staff-form">
            {editId ? t('ui.saveChanges') : t('ui.create')}
          </Button>
        </div>}
      >
        <form id="support-staff-form" onSubmit={onSubmit} className="space-y-3">
          <Input label={t('form.labels.name')} placeholder={t('form.labels.name')} {...register('name')} />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          
          <Select label={t('form.labels.state')} {...register('estado')}>
            {STAFF_STATUSES.map((status) => (
              <option key={status} value={status}>{getSorcererStatusLabel(status)}</option>
            ))}
          </Select>
          {errors.estado && <p className="text-xs text-red-400">{errors.estado.message}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('pages.supportStaff.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
