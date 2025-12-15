/**
 * @fileoverview Subordinations CRUD page.
 *
 * Manages master-disciple relationships between sorcerers.
 *
 * @module pages/subordinations/SubordinationsPage
 */

import { useState, useMemo } from 'react';
import { useInfiniteSubordinations } from '../../hooks/useInfiniteSubordinations';
import { useSubordinations } from '../../hooks/useSubordinations';
import { useInfiniteSorcerers } from '../../hooks/useInfiniteSorcerers';
import type { Subordination, SubordinationType } from '../../types/subordination';
import { SUBORDINATION_TYPE } from '../../types/subordination';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, THead, TBody, TH, TD, SortHeader } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { canMutate as canMutateByRole } from '../../utils/permissions';
import { t } from '../../i18n';

/** Labels for relationship types */
const relationTypeLabel = (type: SubordinationType): string => {
  const labels: Record<SubordinationType, string> = {
    'Tutoría': 'Tutoría',
    'Supervisión': 'Supervisión',
    'LiderazgoEquipo': 'Liderazgo de Equipo',
    'Entrenamiento': 'Entrenamiento',
  };
  return labels[type] ?? type;
};

const schema = z.object({
  maestroId: z.coerce.number().int().positive('Selecciona un maestro'),
  discipuloId: z.coerce.number().int().positive('Selecciona un discípulo'),
  fechaInicio: z.string().min(1, 'Fecha de inicio requerida'),
  fechaFin: z.string().optional(),
  tipoRelacion: z.enum([
    SUBORDINATION_TYPE.tutoria,
    SUBORDINATION_TYPE.supervision,
    SUBORDINATION_TYPE.liderazgoEquipo,
    SUBORDINATION_TYPE.entrenamiento,
  ] as [SubordinationType, ...SubordinationType[]]),
  activa: z.boolean(),
}).refine(data => data.maestroId !== data.discipuloId, {
  message: 'El maestro y el discípulo deben ser diferentes',
  path: ['discipuloId'],
});

type FormValues = z.infer<typeof schema>;

export const SubordinationsPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteSubordinations({ pageSize: 20 });
  const { list, create, update, remove } = useSubordinations();
  const sorcerersQuery = useInfiniteSorcerers({ pageSize: 100 });
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Subordination>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      maestroId: 0,
      discipuloId: 0,
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      tipoRelacion: SUBORDINATION_TYPE.tutoria,
      activa: true,
    },
  });

  const allSorcerers = useMemo(() => 
    (sorcerersQuery.data?.pages ?? []).flatMap((p) => p.items),
    [sorcerersQuery.data]
  );

  const openCreate = () => {
    setEditId(null);
    reset({
      maestroId: 0,
      discipuloId: 0,
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      tipoRelacion: SUBORDINATION_TYPE.tutoria,
      activa: true,
    });
    setShowForm(true);
  };

  const startEdit = (s: Subordination) => {
    setEditId(s.id);
    reset({
      maestroId: s.maestroId,
      discipuloId: s.discipuloId,
      fechaInicio: s.fechaInicio?.split('T')[0] ?? '',
      fechaFin: s.fechaFin?.split('T')[0] ?? '',
      tipoRelacion: s.tipoRelacion,
      activa: s.activa,
    });
    setShowForm(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        fechaFin: values.fechaFin || null,
      };
      
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success(t('toast.subordination.updated'));
      } else {
        await create.mutateAsync(payload as Omit<Subordination, 'id'>);
        toast.success(t('toast.subordination.created'));
      }
      setShowForm(false);
    } catch (err) {
      toast.error(t('toast.saveError'));
    }
  });

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await remove.mutateAsync(deleteId);
        toast.success(t('toast.subordination.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  const flat = useMemo(() => (data?.pages ?? []).flatMap((p) => p.items), [data]);
  
  const sortedData = useMemo(() => {
    const base: Subordination[] = flat.length
      ? flat
      : (list.data?.items ?? []);
    return [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      if (typeof av === 'boolean' && typeof bv === 'boolean') return sortDir === 'asc' ? (av ? 1 : -1) - (bv ? 1 : -1) : (bv ? 1 : -1) - (av ? 1 : -1);
      return sortDir === 'asc'
        ? String(av ?? '').localeCompare(String(bv ?? ''))
        : String(bv ?? '').localeCompare(String(av ?? ''));
    });
  }, [flat, list.data, sortKey, sortDir]);

  const toggleSort = (key: keyof Subordination) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Helper to get sorcerer name by ID
  const getSorcererName = (id: number) => {
    const sorcerer = allSorcerers.find(s => s.id === id);
    return sorcerer?.name ?? `ID: ${id}`;
  };

  if (isLoading) return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  );
  
  if (isError) return <div className="p-4 text-red-400">{t('errors.loadSubordinations')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('pages.subordinations.title')}</h1>
        {canMutate && <Button onClick={openCreate}>{t('ui.new_fem')}</Button>}
      </div>

      {sortedData.length === 0 ? (
        <EmptyState
          title={t('pages.subordinations.emptyTitle')}
          description={canMutate ? t('pages.subordinations.emptyDescHasPerms') : t('pages.subordinations.emptyDescNoPerms')}
          action={canMutate ? <Button onClick={openCreate}>{t('pages.subordinations.createAction')}</Button> : undefined}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label="ID" active={sortKey==='id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label={t('form.labels.master')} active={sortKey==='maestroId'} direction={sortDir} onClick={() => toggleSort('maestroId')} /></TH>
                <TH><SortHeader label={t('form.labels.disciple')} active={sortKey==='discipuloId'} direction={sortDir} onClick={() => toggleSort('discipuloId')} /></TH>
                <TH><SortHeader label={t('form.labels.relationshipType')} active={sortKey==='tipoRelacion'} direction={sortDir} onClick={() => toggleSort('tipoRelacion')} /></TH>
                <TH><SortHeader label={t('form.labels.startDate')} active={sortKey==='fechaInicio'} direction={sortDir} onClick={() => toggleSort('fechaInicio')} /></TH>
                <TH><SortHeader label={t('form.labels.endDate')} active={sortKey==='fechaFin'} direction={sortDir} onClick={() => toggleSort('fechaFin')} /></TH>
                <TH><SortHeader label={t('form.labels.active')} active={sortKey==='activa'} direction={sortDir} onClick={() => toggleSort('activa')} /></TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((s) => (
                <tr key={s.id} className="border-b hover:bg-slate-800/40">
                  <TD>{s.id}</TD>
                  <TD>{s.maestro?.name ?? getSorcererName(s.maestroId)}</TD>
                  <TD>{s.discipulo?.name ?? getSorcererName(s.discipuloId)}</TD>
                  <TD>{relationTypeLabel(s.tipoRelacion)}</TD>
                  <TD>{s.fechaInicio ? new Date(s.fechaInicio).toLocaleDateString() : '-'}</TD>
                  <TD>{s.fechaFin ? new Date(s.fechaFin).toLocaleDateString() : '-'}</TD>
                  <TD>
                    <span className={`px-2 py-1 rounded text-xs ${s.activa ? 'bg-green-900/50 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                      {s.activa ? t('ui.yes') : t('ui.no')}
                    </span>
                  </TD>
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
        title={editId ? `${t('ui.edit')} ${t('pages.subordinations.singular')}` : `${t('ui.new_fem')} ${t('pages.subordinations.singular')}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
            <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="subordination-form">
              {editId ? t('ui.saveChanges') : t('ui.create')}
            </Button>
          </div>
        }
      >
        <form id="subordination-form" onSubmit={onSubmit} className="space-y-3">
          <Controller
            name="maestroId"
            control={control}
            render={({ field }) => (
              <Select label={t('form.labels.master')} {...field} value={field.value || ''}>
                <option value="">{t('ui.selectPlaceholder')}</option>
                {allSorcerers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            )}
          />
          {errors.maestroId && <p className="text-xs text-red-400">{errors.maestroId.message}</p>}

          <Controller
            name="discipuloId"
            control={control}
            render={({ field }) => (
              <Select label={t('form.labels.disciple')} {...field} value={field.value || ''}>
                <option value="">{t('ui.selectPlaceholder')}</option>
                {allSorcerers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            )}
          />
          {errors.discipuloId && <p className="text-xs text-red-400">{errors.discipuloId.message}</p>}

          <Select label={t('form.labels.relationshipType')} {...register('tipoRelacion')}>
            {Object.values(SUBORDINATION_TYPE).map((type) => (
              <option key={type} value={type}>{relationTypeLabel(type)}</option>
            ))}
          </Select>
          {errors.tipoRelacion && <p className="text-xs text-red-400">{errors.tipoRelacion.message}</p>}

          <Input 
            label={t('form.labels.startDate')} 
            type="date" 
            {...register('fechaInicio')} 
          />
          {errors.fechaInicio && <p className="text-xs text-red-400">{errors.fechaInicio.message}</p>}

          <Input 
            label={t('form.labels.endDate')} 
            type="date" 
            {...register('fechaFin')} 
          />
          {errors.fechaFin && <p className="text-xs text-red-400">{errors.fechaFin.message}</p>}

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="activa"
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-jjk-purple focus:ring-jjk-purple"
              {...register('activa')} 
            />
            <label htmlFor="activa" className="text-sm text-slate-300">{t('form.labels.active')}</label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('pages.subordinations.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
