/**
 * @fileoverview Transfer management page component.
 * Provides full CRUD interface for transfers (Traslados) with sortable table,
 * modal forms, and permission-based access control.
 * @module pages/transfers/TransfersPage
 */

import { useMemo, useState } from 'react';
import { useInfiniteTransfers } from '../../hooks/useInfiniteTransfers';
import { useTransfers } from '../../hooks/useTransfers';
import { useLocations } from '../../hooks/useLocations';
import { useMissions } from '../../hooks/useMissions';
import { useSorcerers } from '../../hooks/useSorcerers';
import type { Transfer, TransferPayload, TransferStatus } from '../../types/transfer';
import { Button } from '../../components/ui/Button';
import { truncateText } from '../../utils/truncateText';
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
import { getTransferStatusLabel } from '../../utils/enumLabels';

const TRANSFER_STATUSES: TransferStatus[] = ['programado', 'en_curso', 'finalizado'];

const schema = z.object({
  fecha: z.string().min(1, t('form.validation.required')),
  estado: z.enum(['programado', 'en_curso', 'finalizado']),
  motivo: z.string().optional(),
  origenId: z.coerce.number().min(1, t('form.validation.required')),
  destinoId: z.coerce.number().min(1, t('form.validation.required')),
  misionId: z.coerce.number().min(1, t('form.validation.required')),
});

type FormValues = z.infer<typeof schema>;

export const TransfersPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteTransfers({ pageSize: 20 });
  const { create, update, remove } = useTransfers();
  const { list: locationsList } = useLocations();
  const { list: missionsList } = useMissions();
  const { list: sorcerersList } = useSorcerers();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedSorcererIds, setSelectedSorcererIds] = useState<number[]>([]);

  const locations = useMemo(() => {
    const d = locationsList.data;
    return Array.isArray(d) ? d : d?.items ?? [];
  }, [locationsList.data]);

  const missions = useMemo(() => {
    const d = missionsList.data;
    return Array.isArray(d) ? d : d?.items ?? [];
  }, [missionsList.data]);

  const sorcerers = useMemo(() => {
    const d = sorcerersList.data;
    return Array.isArray(d) ? d : d?.items ?? [];
  }, [sorcerersList.data]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fecha: '', estado: 'programado', motivo: '', origenId: 0, destinoId: 0, misionId: 0 },
  });

  const openCreate = () => {
    setEditId(null);
    reset({ fecha: new Date().toISOString().slice(0, 16), estado: 'programado', motivo: '', origenId: 0, destinoId: 0, misionId: 0 });
    setSelectedSorcererIds([]);
    setShowForm(true);
  };

  const startEdit = (tr: Transfer) => {
    setEditId(tr.id);
    reset({
      fecha: tr.fecha ? tr.fecha.slice(0, 16) : '',
      estado: tr.estado,
      motivo: tr.motivo ?? '',
      origenId: tr.origenId ?? tr.origen?.id ?? 0,
      destinoId: tr.destinoId ?? tr.destino?.id ?? 0,
      misionId: tr.misionId,
    });
    setSelectedSorcererIds(tr.hechiceros?.map(h => h.id) ?? []);
    setShowForm(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: TransferPayload = {
        fecha: new Date(values.fecha).toISOString(),
        estado: values.estado,
        motivo: values.motivo,
        origenId: values.origenId,
        destinoId: values.destinoId,
        misionId: values.misionId,
        hechicerosIds: selectedSorcererIds,
      };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success(t('toast.transfer.updated'));
      } else {
        await create.mutateAsync(payload);
        toast.success(t('toast.transfer.created'));
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
        toast.success(t('toast.transfer.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  const sortedData = useMemo(() => {
    const base: Transfer[] = data?.pages.flatMap((p) => p.items) ?? [];
    return [...base].sort((a, b) => {
      let av: string | number = 0;
      let bv: string | number = 0;
      if (sortKey === 'id') { av = a.id; bv = b.id; }
      else if (sortKey === 'fecha') { av = a.fecha ?? ''; bv = b.fecha ?? ''; }
      else if (sortKey === 'estado') { av = a.estado; bv = b.estado; }
      else if (sortKey === 'origen') { av = a.origen?.nombre ?? ''; bv = b.origen?.nombre ?? ''; }
      else if (sortKey === 'destino') { av = a.destino?.nombre ?? ''; bv = b.destino?.nombre ?? ''; }
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
  if (isError) return <div className="p-4 text-red-400">{t('errors.loadTransfers')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('pages.transfers.title')}</h1>
        {canMutate && <Button onClick={openCreate}>{t('ui.new_masc')}</Button>}
      </div>
      {sortedData.length === 0 ? (
        <EmptyState
          title={t('pages.transfers.emptyTitle')}
          description={canMutate ? t('pages.transfers.emptyDescHasPerms') : t('pages.transfers.emptyDescNoPerms')}
          action={canMutate ? <Button onClick={openCreate}>{t('pages.transfers.createAction')}</Button> : undefined}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label={t('form.labels.date')} active={sortKey === 'fecha'} direction={sortDir} onClick={() => toggleSort('fecha')} /></TH>
                <TH><SortHeader label={t('form.labels.status')} active={sortKey === 'estado'} direction={sortDir} onClick={() => toggleSort('estado')} /></TH>
                <TH><SortHeader label={t('form.labels.origin')} active={sortKey === 'origen'} direction={sortDir} onClick={() => toggleSort('origen')} /></TH>
                <TH><SortHeader label={t('form.labels.destination')} active={sortKey === 'destino'} direction={sortDir} onClick={() => toggleSort('destino')} /></TH>
                <TH><SortHeader label={t('form.labels.mission')} active={sortKey === 'misionId'} direction={sortDir} onClick={() => toggleSort('misionId')} /></TH>
                <TH>{t('form.labels.sorcerers')}</TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((tr) => (
                <tr key={tr.id} className="border-b hover:bg-slate-800/40">
                  <TD>{tr.fecha ? new Date(tr.fecha).toLocaleDateString() : '-'}</TD>
                  <TD>{getTransferStatusLabel(tr.estado)}</TD>
                  <TD>{tr.origen?.nombre ?? '-'}</TD>
                  <TD>{tr.destino?.nombre ?? '-'}</TD>
                  <TD>#{tr.misionId}</TD>
                  <TD title={tr.hechiceros?.map(h => h.name).join(', ') || undefined}>{truncateText(tr.hechiceros?.map(h => h.name).join(', ') || '-', 30)}</TD>
                  {canMutate && (
                    <TD className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(tr)}>{t('ui.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(tr.id)} disabled={remove.isPending}>{t('ui.delete')}</Button>
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
        title={editId ? `${t('ui.edit')} ${t('pages.transfers.singular')}` : `${t('ui.new_masc')} ${t('pages.transfers.singular')}`}
        footer={<div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
          <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="transfer-form">
            {editId ? t('ui.saveChanges') : t('ui.create')}
          </Button>
        </div>}
      >
        <form id="transfer-form" onSubmit={onSubmit} className="space-y-3">
          <Input label={t('form.labels.date')} type="datetime-local" {...register('fecha')} />
          {errors.fecha && <p className="text-xs text-red-400">{errors.fecha.message}</p>}

          <Select label={t('form.labels.status')} {...register('estado')}>
            {TRANSFER_STATUSES.map((s) => (
              <option key={s} value={s}>{getTransferStatusLabel(s)}</option>
            ))}
          </Select>

          <Input label={t('form.labels.reason')} placeholder={t('form.labels.reason')} {...register('motivo')} />

          <Select label={t('form.labels.origin')} {...register('origenId')}>
            <option value={0}>{t('form.placeholders.selectLocation')}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.nombre}</option>
            ))}
          </Select>
          {errors.origenId && <p className="text-xs text-red-400">{errors.origenId.message}</p>}

          <Select label={t('form.labels.destination')} {...register('destinoId')}>
            <option value={0}>{t('form.placeholders.selectLocation')}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.nombre}</option>
            ))}
          </Select>
          {errors.destinoId && <p className="text-xs text-red-400">{errors.destinoId.message}</p>}

          <Select label={t('form.labels.mission')} {...register('misionId')}>
            <option value={0}>{t('form.placeholders.selectMission')}</option>
            {missions.map((m) => (
              <option key={m.id} value={m.id}>#{m.id} - {m.startAt ? new Date(m.startAt).toLocaleDateString() : ''}</option>
            ))}
          </Select>
          {errors.misionId && <p className="text-xs text-red-400">{errors.misionId.message}</p>}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('form.labels.sorcerers')}</label>
            <div className="max-h-40 overflow-y-auto border border-slate-600 rounded-md p-2 space-y-1">
              {sorcerers.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-700/50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedSorcererIds.includes(s.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSorcererIds([...selectedSorcererIds, s.id]);
                      } else {
                        setSelectedSorcererIds(selectedSorcererIds.filter(id => id !== s.id));
                      }
                    }}
                    className="rounded border-slate-600"
                  />
                  <span>{s.name}</span>
                </label>
              ))}
              {sorcerers.length === 0 && <p className="text-xs text-slate-500">{t('form.placeholders.cargando')}</p>}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('pages.transfers.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
