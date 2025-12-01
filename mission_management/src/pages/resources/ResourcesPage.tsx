/**
 * @fileoverview Resource management page component.
 * Provides full CRUD interface for resources (Recursos) with sortable table,
 * modal forms, and permission-based access control.
 * @module pages/resources/ResourcesPage
 */

import { useMemo, useState } from 'react';
import { useInfiniteResources } from '../../hooks/useInfiniteResources';
import { useResources } from '../../hooks/useResources';
import type { PagedResponse } from '../../api/pagedApi';
import type { Resource, ResourceType } from '../../types/resource';
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
import { getResourceTypeLabel } from '../../utils/enumLabels';
import { truncateText } from '../../utils/truncateText';

const RESOURCE_TYPES: ResourceType[] = [
  'EquipamientoDeCombate',
  'Herramienta',
  'Transporte',
  'Suministros',
];

const schema = z.object({
  nombre: z.string().min(2, t('form.validation.nameTooShort')),
  tipoRecurso: z.enum(['EquipamientoDeCombate', 'Herramienta', 'Transporte', 'Suministros']),
  descripcion: z.string().optional(),
  cantidadDisponible: z.coerce.number().min(0, t('form.validation.nonNegative')),
});

type FormValues = z.infer<typeof schema>;

export const ResourcesPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteResources({ pageSize: 20 });
  const { list, create, update, remove } = useResources();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Resource>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', tipoRecurso: 'Herramienta', descripcion: '', cantidadDisponible: 0 },
  });

  const openCreate = () => {
    setEditId(null);
    reset({ nombre: '', tipoRecurso: 'Herramienta', descripcion: '', cantidadDisponible: 0 });
    setShowForm(true);
  };

  const startEdit = (r: Resource) => {
    setEditId(r.id);
    reset({ 
      nombre: r.nombre, 
      tipoRecurso: r.tipoRecurso, 
      descripcion: r.descripcion ?? '', 
      cantidadDisponible: r.cantidadDisponible 
    });
    setShowForm(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload = {
        nombre: values.nombre,
        tipoRecurso: values.tipoRecurso,
        descripcion: values.descripcion,
        cantidadDisponible: values.cantidadDisponible,
      };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success(t('toast.resource.updated'));
      } else {
        await create.mutateAsync(payload);
        toast.success(t('toast.resource.created'));
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
        toast.success(t('toast.resource.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  const flat = useMemo(() => (data?.pages ?? []).flatMap((p) => p.items), [data]);
  const sortedData = useMemo(() => {
    const base: Resource[] = flat.length
      ? flat
      : Array.isArray(list.data)
        ? list.data
        : (list.data as PagedResponse<Resource> | undefined)?.items ?? [];
    return [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [flat, list.data, sortKey, sortDir]);

  const toggleSort = (key: keyof Resource) => {
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
  if (isError) return <div className="p-4 text-red-400">{t('errors.loadResources')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('pages.resources.title')}</h1>
        {canMutate && <Button onClick={openCreate}>{t('ui.new_masc')}</Button>}
      </div>
      {sortedData.length === 0 ? (
        <EmptyState
          title={t('pages.resources.emptyTitle')}
          description={canMutate ? t('pages.resources.emptyDescHasPerms') : t('pages.resources.emptyDescNoPerms')}
          action={canMutate ? <Button onClick={openCreate}>{t('pages.resources.createAction')}</Button> : undefined}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label={t('form.labels.name')} active={sortKey==='nombre'} direction={sortDir} onClick={() => toggleSort('nombre')} /></TH>
                <TH><SortHeader label={t('form.labels.type')} active={sortKey==='tipoRecurso'} direction={sortDir} onClick={() => toggleSort('tipoRecurso')} /></TH>
                <TH><SortHeader label={t('form.labels.quantity')} active={sortKey==='cantidadDisponible'} direction={sortDir} onClick={() => toggleSort('cantidadDisponible')} /></TH>
                <TH>{t('form.labels.description')}</TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-800/40">
                  <TD>{r.nombre}</TD>
                  <TD>{getResourceTypeLabel(r.tipoRecurso)}</TD>
                  <TD>{r.cantidadDisponible}</TD>
                  <TD title={r.descripcion || undefined}>{truncateText(r.descripcion, 40)}</TD>
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
        title={editId ? `${t('ui.edit')} ${t('pages.resources.singular')}` : `${t('ui.new_masc')} ${t('pages.resources.singular')}`}
        footer={<div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
          <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="resource-form">
            {editId ? t('ui.saveChanges') : t('ui.create')}
          </Button>
        </div>}
      >
        <form id="resource-form" onSubmit={onSubmit} className="space-y-3">
          <Input label={t('form.labels.name')} placeholder={t('form.labels.name')} {...register('nombre')} />
          {errors.nombre && <p className="text-xs text-red-400">{errors.nombre.message}</p>}
          
          <Select label={t('form.labels.type')} {...register('tipoRecurso')}>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>{getResourceTypeLabel(type)}</option>
            ))}
          </Select>
          {errors.tipoRecurso && <p className="text-xs text-red-400">{errors.tipoRecurso.message}</p>}
          
          <Input 
            label={t('form.labels.quantity')} 
            type="number" 
            min={0}
            {...register('cantidadDisponible')} 
          />
          {errors.cantidadDisponible && <p className="text-xs text-red-400">{errors.cantidadDisponible.message}</p>}
          
          <Input label={t('form.labels.description')} placeholder={t('form.labels.description')} {...register('descripcion')} />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('pages.resources.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
