/**
 * @fileoverview Request/Solicitud management page component.
 * Provides full CRUD interface for requests with sortable table,
 * modal forms, and permission-based access control.
 * @module pages/requests/RequestsPage
 */

import { useMemo, useState } from 'react';
import { useInfiniteRequests } from '../../hooks/useInfiniteRequests';
import { useRequests } from '../../hooks/useRequests';
import { useCurses } from '../../hooks/useCurses';
import type { PagedResponse } from '../../api/pagedApi';
import type { Request, RequestStatus } from '../../types/request';
import type { Curse } from '../../types/curse';
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
import { getRequestStatusLabel } from '../../utils/enumLabels';

const REQUEST_STATUSES: RequestStatus[] = ['pendiente', 'atendiendose', 'atendida'];

const schema = z.object({
  maldicionId: z.coerce.number().min(1, t('form.validation.curseRequired')),
  estado: z.enum(['pendiente', 'atendiendose', 'atendida']),
});

type FormValues = z.infer<typeof schema>;

export const RequestsPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteRequests({ pageSize: 20 });
  const { list, create, update, remove } = useRequests();
  const { list: cursesList } = useCurses();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Request>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { maldicionId: 0, estado: 'pendiente' },
  });

  // Get curses for dropdown
  const curses: Curse[] = useMemo(() => {
    if (Array.isArray(cursesList.data)) return cursesList.data as Curse[];
    return (cursesList.data as PagedResponse<Curse> | undefined)?.items ?? [];
  }, [cursesList.data]);

  const openCreate = () => {
    setEditId(null);
    reset({ maldicionId: curses[0]?.id ?? 0, estado: 'pendiente' });
    setShowForm(true);
  };

  const startEdit = (r: Request) => {
    setEditId(r.id);
    reset({ maldicionId: r.maldicionId, estado: r.estado });
    setShowForm(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        maldicionId: values.maldicionId,
        estado: values.estado,
      };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success(t('toast.request.updated'));
      } else {
        await create.mutateAsync(payload);
        toast.success(t('toast.request.created'));
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
        toast.success(t('toast.request.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  const flat = useMemo(() => (data?.pages ?? []).flatMap((p) => p.items), [data]);
  const sortedData = useMemo(() => {
    const base: Request[] = flat.length
      ? flat
      : Array.isArray(list.data)
        ? list.data
        : (list.data as PagedResponse<Request> | undefined)?.items ?? [];
    return [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [flat, list.data, sortKey, sortDir]);

  const toggleSort = (key: keyof Request) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const getCurseName = (maldicionId: number): string => {
    const curse = curses.find(c => c.id === maldicionId);
    return curse?.nombre ?? `#${maldicionId}`;
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
  if (isError) return <div className="p-4 text-red-400">{t('errors.loadRequests')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('pages.requests.title')}</h1>
        {canMutate && <Button onClick={openCreate}>{t('ui.new_fem')}</Button>}
      </div>
      {sortedData.length === 0 ? (
        <EmptyState
          title={t('pages.requests.emptyTitle')}
          description={canMutate ? t('pages.requests.emptyDescHasPerms') : t('pages.requests.emptyDescNoPerms')}
          action={canMutate ? <Button onClick={openCreate}>{t('pages.requests.createAction')}</Button> : undefined}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label="ID" active={sortKey==='id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label={t('form.labels.curse')} active={sortKey==='maldicionId'} direction={sortDir} onClick={() => toggleSort('maldicionId')} /></TH>
                <TH><SortHeader label={t('form.labels.state')} active={sortKey==='estado'} direction={sortDir} onClick={() => toggleSort('estado')} /></TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-800/40">
                  <TD>{r.id}</TD>
                  <TD>{getCurseName(r.maldicionId)}</TD>
                  <TD>{getRequestStatusLabel(r.estado)}</TD>
                  {canMutate && (
                    <TD className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(r)}>{t('ui.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(r.id)} disabled={remove.isPending}>{t('ui.delete')}</Button>
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
        title={editId ? `${t('ui.edit')} ${t('pages.requests.singular')}` : `${t('ui.new_fem')} ${t('pages.requests.singular')}`}
        footer={<div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
          <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="request-form">
            {editId ? t('ui.saveChanges') : t('ui.create')}
          </Button>
        </div>}
      >
        <form id="request-form" onSubmit={onSubmit} className="space-y-3">
          <Select label={t('form.labels.curse')} {...register('maldicionId')}>
            <option value="">{t('ui.selectPlaceholder')}</option>
            {curses.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </Select>
          {errors.maldicionId && <p className="text-xs text-red-400">{errors.maldicionId.message}</p>}
          
          <Select label={t('form.labels.state')} {...register('estado')}>
            {REQUEST_STATUSES.map((status) => (
              <option key={status} value={status}>{getRequestStatusLabel(status)}</option>
            ))}
          </Select>
          {errors.estado && <p className="text-xs text-red-400">{errors.estado.message}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('pages.requests.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
