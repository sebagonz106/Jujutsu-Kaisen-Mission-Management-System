/**
 * @fileoverview Sorcerers In Charge management page component.
 * Provides full CRUD interface for sorcerers-in-charge (HechiceroEncargado) with sortable table,
 * modal forms, and permission-based access control.
 * @module pages/sorcerers-in-charge/SorcerersInChargePage
 */

import { useMemo, useState } from 'react';
import { useInfiniteSorcerersInCharge } from '../../hooks/useInfiniteSorcerersInCharge';
import { useSorcerersInCharge } from '../../hooks/useSorcerersInCharge';
import { useSorcerers } from '../../hooks/useSorcerers';
import { useRequests } from '../../hooks/useRequests';
import { useMissions } from '../../hooks/useMissions';
import type { SorcererInCharge, SorcererInChargePayload } from '../../types/sorcererInCharge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
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

const schema = z.object({
  hechiceroId: z.coerce.number().min(1, t('form.validation.required')),
  solicitudId: z.coerce.number().min(1, t('form.validation.required')),
  misionId: z.coerce.number().min(1, t('form.validation.required')),
});

type FormValues = z.infer<typeof schema>;

export const SorcerersInChargePage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteSorcerersInCharge({ pageSize: 20 });
  const { create, update, remove } = useSorcerersInCharge();
  const { list: sorcerersList } = useSorcerers();
  const { list: requestsList } = useRequests();
  const { list: missionsList } = useMissions();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorcerers = useMemo(() => {
    const d = sorcerersList.data;
    return Array.isArray(d) ? d : d?.items ?? [];
  }, [sorcerersList.data]);

  const requests = useMemo(() => {
    const d = requestsList.data;
    return Array.isArray(d) ? d : d?.items ?? [];
  }, [requestsList.data]);

  const missions = useMemo(() => {
    const d = missionsList.data;
    return Array.isArray(d) ? d : d?.items ?? [];
  }, [missionsList.data]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { hechiceroId: 0, solicitudId: 0, misionId: 0 },
  });

  const openCreate = () => {
    setEditId(null);
    reset({ hechiceroId: 0, solicitudId: 0, misionId: 0 });
    setShowForm(true);
  };

  const startEdit = (sic: SorcererInCharge) => {
    setEditId(sic.id);
    reset({
      hechiceroId: sic.hechiceroId,
      solicitudId: sic.solicitudId,
      misionId: sic.misionId,
    });
    setShowForm(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: SorcererInChargePayload = {
        hechiceroId: values.hechiceroId,
        solicitudId: values.solicitudId,
        misionId: values.misionId,
      };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success(t('toast.sorcererInCharge.updated'));
      } else {
        await create.mutateAsync(payload);
        toast.success(t('toast.sorcererInCharge.created'));
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
        toast.success(t('toast.sorcererInCharge.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  const sortedData = useMemo(() => {
    const base: SorcererInCharge[] = data?.pages.flatMap((p) => p.items) ?? [];
    return [...base].sort((a, b) => {
      let av: string | number = 0;
      let bv: string | number = 0;
      if (sortKey === 'id') { av = a.id; bv = b.id; }
      else if (sortKey === 'hechicero') { av = a.hechicero?.name ?? ''; bv = b.hechicero?.name ?? ''; }
      else if (sortKey === 'solicitudId') { av = a.solicitudId; bv = b.solicitudId; }
      else if (sortKey === 'misionId') { av = a.misionId; bv = b.misionId; }
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
  if (isError) return <div className="p-4 text-red-400">{t('errors.loadSorcerersInCharge')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('pages.sorcerersInCharge.title')}</h1>
        {canMutate && <Button onClick={openCreate}>{t('ui.new_masc')}</Button>}
      </div>
      {sortedData.length === 0 ? (
        <EmptyState
          title={t('pages.sorcerersInCharge.emptyTitle')}
          description={canMutate ? t('pages.sorcerersInCharge.emptyDescHasPerms') : t('pages.sorcerersInCharge.emptyDescNoPerms')}
          action={canMutate ? <Button onClick={openCreate}>{t('pages.sorcerersInCharge.createAction')}</Button> : undefined}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label={t('form.labels.sorcerer')} active={sortKey === 'hechicero'} direction={sortDir} onClick={() => toggleSort('hechicero')} /></TH>
                <TH><SortHeader label={t('form.labels.request')} active={sortKey === 'solicitudId'} direction={sortDir} onClick={() => toggleSort('solicitudId')} /></TH>
                <TH><SortHeader label={t('form.labels.mission')} active={sortKey === 'misionId'} direction={sortDir} onClick={() => toggleSort('misionId')} /></TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((sic) => (
                <tr key={sic.id} className="border-b hover:bg-slate-800/40">
                  <TD>{sic.hechicero?.name ?? '-'}</TD>
                  <TD>#{sic.solicitudId}</TD>
                  <TD>#{sic.misionId}</TD>
                  {canMutate && (
                    <TD className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(sic)}>{t('ui.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(sic.id)} disabled={remove.isPending}>{t('ui.delete')}</Button>
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
        title={editId ? `${t('ui.edit')} ${t('pages.sorcerersInCharge.singular')}` : `${t('ui.new_masc')} ${t('pages.sorcerersInCharge.singular')}`}
        footer={<div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
          <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="sorcerer-in-charge-form">
            {editId ? t('ui.saveChanges') : t('ui.create')}
          </Button>
        </div>}
      >
        <form id="sorcerer-in-charge-form" onSubmit={onSubmit} className="space-y-3">
          <Select label={t('form.labels.sorcerer')} {...register('hechiceroId')}>
            <option value={0}>{t('form.placeholders.selectSorcerer')}</option>
            {sorcerers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          {errors.hechiceroId && <p className="text-xs text-red-400">{errors.hechiceroId.message}</p>}

          <Select label={t('form.labels.request')} {...register('solicitudId')}>
            <option value={0}>{t('form.placeholders.selectRequest')}</option>
            {requests.map((r) => (
              <option key={r.id} value={r.id}>#{r.id} - {r.estado}</option>
            ))}
          </Select>
          {errors.solicitudId && <p className="text-xs text-red-400">{errors.solicitudId.message}</p>}

          <Select label={t('form.labels.mission')} {...register('misionId')}>
            <option value={0}>{t('form.placeholders.selectMission')}</option>
            {missions.map((m) => (
              <option key={m.id} value={m.id}>#{m.id} - {m.startAt ? new Date(m.startAt).toLocaleDateString() : ''}</option>
            ))}
          </Select>
          {errors.misionId && <p className="text-xs text-red-400">{errors.misionId.message}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('pages.sorcerersInCharge.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
