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
import { useSorcerers } from '../../hooks/useSorcerers';
import { requestApi } from '../../api/requestApi';
import type { PagedResponse } from '../../api/pagedApi';
import type { Request, RequestStatus, UpdateRequestPayload } from '../../types/request';
import type { Curse } from '../../types/curse';
import { CURSE_TYPE } from '../../types/curse';
import type { Sorcerer } from '../../types/sorcerer';
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

const updateSchema = z.object({
  estado: z.enum(['pendiente', 'atendiendose', 'atendida']),
  hechiceroEncargadoId: z.coerce.number().optional(),
  nivelUrgencia: z.enum(['Planificada', 'Urgente', 'EmergenciaCritica']).optional(),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

export const RequestsPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteRequests({ pageSize: 20 });
  const { list, update, remove } = useRequests();
  const { list: cursesList } = useCurses();
  const { list: sorcerersList } = useSorcerers();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Request>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null);

  const { register: registerUpdate, handleSubmit: handleUpdateSubmit, reset: resetUpdate, watch: watchUpdate, formState: { errors: errorsUpdate, isSubmitting: isSubmittingUpdate } } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { estado: 'pendiente', hechiceroEncargadoId: undefined, nivelUrgencia: undefined },
  });

  // Watch the current estado value in the form
  const currentEstado = watchUpdate('estado');

  // Get curses for dropdown
  const curses: Curse[] = useMemo(() => {
    if (Array.isArray(cursesList.data)) return cursesList.data as Curse[];
    return (cursesList.data as PagedResponse<Curse> | undefined)?.items ?? [];
  }, [cursesList.data]);

  // Get sorcerers for dropdown
  const sorcerers: Sorcerer[] = useMemo(() => {
    if (Array.isArray(sorcerersList.data)) return sorcerersList.data as Sorcerer[];
    return (sorcerersList.data as PagedResponse<Sorcerer> | undefined)?.items ?? [];
  }, [sorcerersList.data]);

  const getSorcererName = (sorcererId: number | undefined): string => {
    if (!sorcererId) return '-';
    const sorcerer = sorcerers.find(s => s.id === sorcererId);
    return sorcerer?.name ?? `#${sorcererId}`;
  };

  const getCurseName = (maldicionId: number): string => {
    const curse = curses.find(c => c.id === maldicionId);
    return curse?.nombre ?? `#${maldicionId}`;
  };

  const openEdit = (r: Request) => {
    setEditId(r.id);
    setCurrentRequest(r);
    // Load detailed info from backend to get hechiceroEncargadoId and nivelUrgencia
    requestApi.getDetail(r.id).then(detail => {
      resetUpdate({ 
        estado: r.estado, 
        hechiceroEncargadoId: detail.hechiceroEncargadoId, 
        nivelUrgencia: detail.nivelUrgencia 
      });
    }).catch(() => {
      // Fallback if detail load fails
      resetUpdate({ 
        estado: r.estado, 
        hechiceroEncargadoId: undefined, 
        nivelUrgencia: undefined 
      });
    });
    setShowForm(true);
  };

  const onUpdateSubmit = handleUpdateSubmit(async (values) => {
    if (!editId || !currentRequest) return;
    try {
      const payload: UpdateRequestPayload = {
        estado: values.estado,
        hechiceroEncargadoId: values.hechiceroEncargadoId ? parseInt(String(values.hechiceroEncargadoId)) : undefined,
        nivelUrgencia: values.nivelUrgencia,
      };
      const result = await update.mutateAsync({ id: editId, payload });
      
      // Handle cascading response
      if (result && 'generatedData' in result && result.generatedData?.misionId) {
        const misionId = result.generatedData.misionId;
        toast.success(
          `${t('toast.request.updated')}. ${t('pages.missions.singular')} #${misionId} ${t('toast.created')}`,
          {
            action: {
              label: t('ui.view'),
              onClick: () => {
                window.location.hash = `#/missions/${misionId}`;
              },
            },
          }
        );
      } else {
        toast.success(t('toast.request.updated'));
      }
      setShowForm(false);
    } catch {
      toast.error(t('toast.saveError'));
    }
  });

  const confirmDelete = async () => {
    if (deleteId) {
      // TODO: Backend debe agregar parametro bool isDeleted a modelo Maldicion para permitir eliminacion condicional
      // const listData = list.data as { items?: Request[] } | undefined;
      // const allRequests: Request[] = listData?.items ?? [];
      // const requestToDelete = allRequests.find(r => r.id === deleteId);
      // const curseToDelete = curses.find(c => c.id === requestToDelete?.maldicionId);
      // if (curseToDelete && curseToDelete.tipo !== CURSE_TYPE.desconocida) {
      //   toast.error('Solo se pueden eliminar solicitudes vinculadas a maldiciones de tipo desconocida');
      //   return;
      // }
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
    const listData = list.data as { items?: Request[] } | undefined;
    const base: Request[] = flat.length
      ? flat
      : (listData?.items ?? []);
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
      </div>
      {sortedData.length === 0 ? (
        <EmptyState
          title={t('pages.requests.emptyTitle')}
          description={t('pages.requests.emptyDescNoPerms')}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label={t('ui.numero')} active={sortKey==='id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label={t('form.labels.curse')} active={sortKey==='maldicionId'} direction={sortDir} onClick={() => toggleSort('maldicionId')} /></TH>
                <TH><SortHeader label={t('form.labels.state')} active={sortKey==='estado'} direction={sortDir} onClick={() => toggleSort('estado')} /></TH>
                <TH>{t('form.labels.sorcererInCharge')}</TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((r) => {
                const stateColors: Record<RequestStatus, string> = {
                  pendiente: 'bg-red-900/60 text-red-200',
                  atendiendose: 'bg-orange-900/60 text-orange-200',
                  atendida: 'bg-green-900/60 text-green-200',
                };
                return (
                  <tr key={r.id} className="border-b hover:bg-slate-800/40">
                    <TD>{r.id}</TD>
                    <TD>{getCurseName(r.maldicionId)}</TD>
                    <TD>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${stateColors[r.estado]}`}>
                        {getRequestStatusLabel(r.estado)}
                      </span>
                    </TD>
                    <TD>{getSorcererName(r.hechiceroEncargadoId)}</TD>
                    {canMutate && (
                      <TD className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(r)} disabled={r.estado === 'atendida'}>{t('ui.edit')}</Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteId(r.id)} disabled={remove.isPending}>{t('ui.delete')}</Button>
                      </TD>
                    )}
                  </tr>
                );
              })}
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
        open={showForm && canMutate && editId !== null && currentRequest !== null}
        onClose={() => setShowForm(false)}
        title={`${t('ui.edit')} ${t('pages.requests.singular')}`}
        footer={currentRequest?.estado === 'atendida' ? 
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.close')}</Button>
          </div>
          : <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
            <Button 
              disabled={!canMutate || isSubmittingUpdate || update.isPending} 
              type="submit" 
              form="request-form"
            >
              {t('ui.saveChanges')}
            </Button>
          </div>
        }
      >
        {currentRequest && (
          <form id="request-form" onSubmit={onUpdateSubmit} className="space-y-3">
          {currentRequest?.estado === 'atendida' ? (
            <div className="space-y-2 text-sm text-slate-400">
              <div>
                <span className="font-medium text-slate-300">{t('form.labels.curse')}:</span> {getCurseName(currentRequest.maldicionId)}
              </div>
              <div>
                <span className="font-medium text-slate-300">{t('form.labels.state')}:</span> {getRequestStatusLabel(currentRequest.estado)}
              </div>
              <div>
                <span className="font-medium text-slate-300">{t('form.labels.sorcererInCharge')}:</span> {getSorcererName(currentRequest.hechiceroEncargadoId)}
              </div>
              {currentRequest.nivelUrgencia && (
                <div>
                  <span className="font-medium text-slate-300">{t('form.labels.urgency')}:</span> {currentRequest.nivelUrgencia}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="text-sm text-slate-400">
                <span className="font-medium text-slate-300">{t('form.labels.curse')}:</span> {getCurseName(currentRequest!.maldicionId)}
              </div>

              <Select label={t('form.labels.state')} {...registerUpdate('estado')}>
                {currentRequest?.estado === 'pendiente' && (
                  <>
                    <option value="pendiente">{getRequestStatusLabel('pendiente')}</option>
                    <option value="atendiendose">{getRequestStatusLabel('atendiendose')}</option>
                  </>
                )}
                {currentRequest?.estado === 'atendiendose' && (
                  <>
                    <option value="atendiendose">{getRequestStatusLabel('atendiendose')}</option>
                    <option value="atendida">{getRequestStatusLabel('atendida')}</option>
                  </>
                )}
              </Select>
              {errorsUpdate.estado && <p className="text-xs text-red-400">{errorsUpdate.estado.message}</p>}

              {(currentRequest?.estado === 'pendiente' || currentRequest?.estado === 'atendiendose') && (
                <>
                  <Select 
                    label={t('form.labels.sorcererInCharge')} 
                    {...registerUpdate('hechiceroEncargadoId')}
                    disabled={currentEstado === 'pendiente'}
                  >
                    <option value="">{t('ui.selectPlaceholder')}</option>
                    {sorcerers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                  {errorsUpdate.hechiceroEncargadoId && <p className="text-xs text-red-400">{errorsUpdate.hechiceroEncargadoId.message}</p>}

                  <Select 
                    label={t('form.labels.urgency')} 
                    {...registerUpdate('nivelUrgencia')}
                    disabled={currentEstado === 'pendiente'}
                  >
                    <option value="">{t('ui.selectPlaceholder')}</option>
                    <option value="Planificada">Planificada</option>
                    <option value="Urgente">Urgente</option>
                    <option value="EmergenciaCritica">Emergencia Crítica</option>
                  </Select>
                  {errorsUpdate.nivelUrgencia && <p className="text-xs text-red-400">{errorsUpdate.nivelUrgencia.message}</p>}
                </>
              )}
            </>
          )}
          </form>
        )}
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
