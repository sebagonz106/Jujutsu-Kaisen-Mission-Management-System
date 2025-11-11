import { useMemo, useState } from 'react';
import { useTechniques } from '../../hooks/useTechniques';
import type { PagedResponse } from '../../api/pagedApi';
import type { Technique, TechniqueType } from '../../types/technique';
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

const TYPES: TechniqueType[] = ['amplificacion', 'dominio', 'restriccion', 'soporte'];

const schema = z.object({
  nombre: z.string().min(2, 'El nombre es demasiado corto'),
  tipo: z.enum(['amplificacion', 'dominio', 'restriccion', 'soporte']),
  efectividadProm: z.coerce.number().min(0).max(100),
  condicionesDeUso: z.string().min(0),
});

type FormValues = z.infer<typeof schema>;

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
    defaultValues: {
      nombre: '',
      tipo: 'amplificacion',
      efectividadProm: 0,
      condicionesDeUso: '',
    },
  });

  const openCreate = () => {
    setEditId(null);
    reset({ nombre: '', tipo: 'amplificacion', efectividadProm: 0, condicionesDeUso: '' });
    setShowForm(true);
  };
  const startEdit = (it: Technique) => {
    setEditId(it.id);
    reset({ nombre: it.nombre, tipo: it.tipo, efectividadProm: it.efectividadProm, condicionesDeUso: it.condicionesDeUso });
    setShowForm(true);
  };
  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: Omit<Technique, 'id'> = {
        nombre: values.nombre,
        tipo: values.tipo,
        efectividadProm: values.efectividadProm,
        condicionesDeUso: values.condicionesDeUso,
      };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success('Técnica actualizada');
      } else {
        await create.mutateAsync(payload);
        toast.success('Técnica creada');
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
        toast.success(t('toast.generic.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  const base = Array.isArray(list.data) ? list.data : (list.data as PagedResponse<Technique> | undefined)?.items ?? [];
  const sortedData = useMemo(() => {
    return [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [base, sortKey, sortDir]);

  const toggleSort = (key: keyof Technique) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const isLoading = list.isLoading;
  const isError = !!list.isError;

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
  if (isError) return <div className="p-4 text-red-400">Error al cargar técnicas</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Técnicas Malditas</h1>
        {canMutate && <Button onClick={openCreate}>{t('ui.new_fem')}</Button>}
      </div>
      {sortedData.length === 0 ? (
        <EmptyState title={'Sin técnicas'} description={'Aún no hay técnicas registradas.'} action={canMutate ? <Button onClick={openCreate}>{t('ui.create')}</Button> : undefined} />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label={t('ui.id')} active={sortKey==='id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label={'Nombre'} active={sortKey==='nombre'} direction={sortDir} onClick={() => toggleSort('nombre')} /></TH>
                <TH><SortHeader label={'Tipo'} active={sortKey==='tipo'} direction={sortDir} onClick={() => toggleSort('tipo')} /></TH>
                <TH><SortHeader label={'Efectividad'} active={sortKey==='efectividadProm'} direction={sortDir} onClick={() => toggleSort('efectividadProm')} /></TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((it) => (
                <tr key={it.id} className="border-b hover:bg-slate-800/40">
                  <TD>{it.id}</TD>
                  <TD>{it.nombre}</TD>
                  <TD>{it.tipo}</TD>
                  <TD>{it.efectividadProm}</TD>
                  {canMutate && (
                    <TD className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(it)}>{t('ui.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(it.id)} disabled={remove.isPending}>{t('ui.delete')}</Button>
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
        title={editId ? `${t('ui.edit')} Técnica` : `${t('ui.new_fem')} Técnica`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
            <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="tech-form">
              {editId ? t('ui.saveChanges') : t('ui.create')}
            </Button>
          </div>
        }
      >
        <form id="tech-form" onSubmit={onSubmit} className="space-y-3">
          <Input label={'Nombre'} placeholder={'Nombre'} {...register('nombre')} />
          {errors.nombre && <p className="text-xs text-red-400">{errors.nombre.message}</p>}
          <Select label={'Tipo'} {...register('tipo')}>
            {TYPES.map(tp => (<option key={tp} value={tp}>{tp}</option>))}
          </Select>
          <Input label={'Efectividad promedio'} type="number" {...register('efectividadProm', { valueAsNumber: true })} />
          {errors.efectividadProm && <p className="text-xs text-red-400">{errors.efectividadProm.message}</p>}
          <Input label={'Condiciones de uso'} placeholder={'Condiciones'} {...register('condicionesDeUso')} />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={'Eliminar técnica'}
        description={'Esta acción no se puede deshacer.'}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
