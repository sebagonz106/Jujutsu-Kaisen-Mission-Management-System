/**
 * @fileoverview Resource Usage management page component.
 * Provides full CRUD interface for resource usages (UsoDeRecurso) with sortable table,
 * modal forms, and permission-based access control.
 * @module pages/resource-usages/ResourceUsagesPage
 */

import { useMemo, useState } from 'react';
import { useInfiniteResourceUsages } from '../../hooks/useInfiniteResourceUsages';
import { useResourceUsages } from '../../hooks/useResourceUsages';
import { useResources } from '../../hooks/useResources';
import { useMissions } from '../../hooks/useMissions';
import type { ResourceUsage, ResourceUsagePayload } from '../../types/resourceUsage';
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
import { truncateText } from '../../utils/truncateText';

const schema = z.object({
  misionId: z.coerce.number().min(1, t('form.validation.required')),
  recursoId: z.coerce.number().min(1, t('form.validation.required')),
  fechaInicio: z.string().min(1, t('form.validation.required')),
  fechaFin: z.string().optional(),
  cantidad: z.coerce.number().min(1, t('form.validation.minOne')),
  observaciones: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const ResourceUsagesPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteResourceUsages({ pageSize: 20 });
  const { create, update, remove } = useResourceUsages();
  const { list: resourcesList } = useResources();
  const { list: missionsList } = useMissions();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const resources = useMemo(() => {
    const d = resourcesList.data;
    return Array.isArray(d) ? d : d?.items ?? [];
  }, [resourcesList.data]);

  const missions = useMemo(() => {
    const d = missionsList.data;
    return Array.isArray(d) ? d : d?.items ?? [];
  }, [missionsList.data]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { misionId: 0, recursoId: 0, fechaInicio: '', fechaFin: '', cantidad: 1, observaciones: '' },
  });

  const openCreate = () => {
    setEditId(null);
    reset({ misionId: 0, recursoId: 0, fechaInicio: new Date().toISOString().slice(0, 16), fechaFin: '', cantidad: 1, observaciones: '' });
    setShowForm(true);
  };

  const startEdit = (ru: ResourceUsage) => {
    setEditId(ru.id);
    reset({
      misionId: ru.misionId,
      recursoId: ru.recursoId,
      fechaInicio: ru.fechaInicio ? ru.fechaInicio.slice(0, 16) : '',
      fechaFin: ru.fechaFin ? ru.fechaFin.slice(0, 16) : '',
      cantidad: ru.cantidad,
      observaciones: ru.observaciones ?? '',
    });
    setShowForm(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: ResourceUsagePayload = {
        misionId: values.misionId,
        recursoId: values.recursoId,
        fechaInicio: new Date(values.fechaInicio).toISOString(),
        fechaFin: values.fechaFin ? new Date(values.fechaFin).toISOString() : undefined,
        cantidad: values.cantidad,
        observaciones: values.observaciones,
      };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success(t('toast.resourceUsage.updated'));
      } else {
        await create.mutateAsync(payload);
        toast.success(t('toast.resourceUsage.created'));
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
        toast.success(t('toast.resourceUsage.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  const sortedData = useMemo(() => {
    const base: ResourceUsage[] = data?.pages.flatMap((p) => p.items) ?? [];
    return [...base].sort((a, b) => {
      let av: string | number = 0;
      let bv: string | number = 0;
      if (sortKey === 'id') { av = a.id; bv = b.id; }
      else if (sortKey === 'misionId') { av = a.misionId; bv = b.misionId; }
      else if (sortKey === 'recurso') { av = a.recurso?.nombre ?? ''; bv = b.recurso?.nombre ?? ''; }
      else if (sortKey === 'fechaInicio') { av = a.fechaInicio ?? ''; bv = b.fechaInicio ?? ''; }
      else if (sortKey === 'cantidad') { av = a.cantidad; bv = b.cantidad; }
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [data, sortKey, sortDir]);

  const toggleSort = (key: string) => {
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
  if (isError) return <div className="p-4 text-red-400">{t('errors.loadResourceUsages')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('pages.resourceUsages.title')}</h1>
        {canMutate && <Button onClick={openCreate}>{t('ui.new_masc')}</Button>}
      </div>
      {sortedData.length === 0 ? (
        <EmptyState
          title={t('pages.resourceUsages.emptyTitle')}
          description={canMutate ? t('pages.resourceUsages.emptyDescHasPerms') : t('pages.resourceUsages.emptyDescNoPerms')}
          action={canMutate ? <Button onClick={openCreate}>{t('pages.resourceUsages.createAction')}</Button> : undefined}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label={t('form.labels.mission')} active={sortKey === 'misionId'} direction={sortDir} onClick={() => toggleSort('misionId')} /></TH>
                <TH><SortHeader label={t('form.labels.resource')} active={sortKey === 'recurso'} direction={sortDir} onClick={() => toggleSort('recurso')} /></TH>
                <TH><SortHeader label={t('form.labels.quantity')} active={sortKey === 'cantidad'} direction={sortDir} onClick={() => toggleSort('cantidad')} /></TH>
                <TH><SortHeader label={t('form.labels.startDate')} active={sortKey === 'fechaInicio'} direction={sortDir} onClick={() => toggleSort('fechaInicio')} /></TH>
                <TH>{t('form.labels.endDate')}</TH>
                <TH>{t('form.labels.observations')}</TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((ru) => (
                <tr key={ru.id} className="border-b hover:bg-slate-800/40">
                  <TD>#{ru.misionId}</TD>
                  <TD>{ru.recurso?.nombre ?? '-'}</TD>
                  <TD>{ru.cantidad}</TD>
                  <TD>{ru.fechaInicio ? new Date(ru.fechaInicio).toLocaleDateString() : '-'}</TD>
                  <TD>{ru.fechaFin ? new Date(ru.fechaFin).toLocaleDateString() : '-'}</TD>
                  <TD title={ru.observaciones || undefined}>{truncateText(ru.observaciones, 30)}</TD>
                  {canMutate && (
                    <TD className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(ru)}>{t('ui.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(ru.id)} disabled={remove.isPending}>{t('ui.delete')}</Button>
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
          <Button variant="secondary" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? t('ui.loadingMore') : t('ui.loadMore')}
          </Button>
        </div>
      )}

      <Modal
        open={showForm && canMutate}
        onClose={() => setShowForm(false)}
        title={editId ? `${t('ui.edit')} ${t('pages.resourceUsages.singular')}` : `${t('ui.new_masc')} ${t('pages.resourceUsages.singular')}`}
        footer={<div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
          <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="resource-usage-form">
            {editId ? t('ui.saveChanges') : t('ui.create')}
          </Button>
        </div>}
      >
        <form id="resource-usage-form" onSubmit={onSubmit} className="space-y-3">
          <Select label={t('form.labels.mission')} {...register('misionId')}>
            <option value={0}>{t('form.placeholders.selectMission')}</option>
            {missions.map((m) => (
              <option key={m.id} value={m.id}>#{m.id} - {m.startAt ? new Date(m.startAt).toLocaleDateString() : ''}</option>
            ))}
          </Select>
          {errors.misionId && <p className="text-xs text-red-400">{errors.misionId.message}</p>}

          <Select label={t('form.labels.resource')} {...register('recursoId')}>
            <option value={0}>{t('form.placeholders.selectResource')}</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </Select>
          {errors.recursoId && <p className="text-xs text-red-400">{errors.recursoId.message}</p>}

          <Input label={t('form.labels.quantity')} type="number" min={1} {...register('cantidad')} />
          {errors.cantidad && <p className="text-xs text-red-400">{errors.cantidad.message}</p>}

          <Input label={t('form.labels.startDate')} type="datetime-local" {...register('fechaInicio')} />
          {errors.fechaInicio && <p className="text-xs text-red-400">{errors.fechaInicio.message}</p>}

          <Input label={t('form.labels.endDate')} type="datetime-local" {...register('fechaFin')} />

          <Input label={t('form.labels.observations')} placeholder={t('form.labels.observations')} {...register('observaciones')} />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('pages.resourceUsages.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
