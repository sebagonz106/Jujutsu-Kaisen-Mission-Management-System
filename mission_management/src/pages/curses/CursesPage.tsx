import { useMemo, useState } from 'react';
import { useCurses } from '../../hooks/useCurses';
import { useInfiniteCurses } from '../../hooks/useInfiniteCurses';
import type { PagedResponse } from '../../api/pagedApi';
import type { Curse } from '../../types/curse';
import { CURSE_GRADE, CURSE_TYPE, CURSE_STATE, CURSE_DANGER_LEVEL } from '../../types/curse';
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

const schema = z.object({
  nombre: z.string().min(2, t('form.validation.nameTooShort')),
  ubicacionDeAparicion: z.string().min(2, t('form.validation.locationRequired')),
  fechaYHoraDeAparicion: z.string(),
  grado: z.union([
    z.literal(CURSE_GRADE.grado_1),
    z.literal(CURSE_GRADE.grado_2),
    z.literal(CURSE_GRADE.grado_3),
    z.literal(CURSE_GRADE.semi_especial),
    z.literal(CURSE_GRADE.especial),
  ]),
  tipo: z.union([
    z.literal(CURSE_TYPE.maligna),
    z.literal(CURSE_TYPE.semi_maldicion),
    z.literal(CURSE_TYPE.residual),
    z.literal(CURSE_TYPE.desconocida),
  ]),
  estadoActual: z.union([
    z.literal(CURSE_STATE.activa),
    z.literal(CURSE_STATE.en_proceso_de_exorcismo),
    z.literal(CURSE_STATE.exorcisada),
  ]),
  nivelPeligro: z.union([
    z.literal(CURSE_DANGER_LEVEL.bajo),
    z.literal(CURSE_DANGER_LEVEL.moderado),
    z.literal(CURSE_DANGER_LEVEL.alto),
  ]),
});
type FormValues = z.infer<typeof schema>;

export const CursesPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteCurses({ pageSize: 20 });
  const { list, create, update, remove } = useCurses();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Curse>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      ubicacionDeAparicion: '',
      grado: CURSE_GRADE.grado_1,
      tipo: CURSE_TYPE.maligna,
      estadoActual: CURSE_STATE.activa,
      nivelPeligro: CURSE_DANGER_LEVEL.bajo,
      fechaYHoraDeAparicion: new Date().toISOString(),
    },
  });

  const openCreate = () => {
    setEditId(null);
    reset({ nombre: '', ubicacionDeAparicion: '', grado: CURSE_GRADE.grado_1, tipo: CURSE_TYPE.maligna, estadoActual: CURSE_STATE.activa, nivelPeligro: CURSE_DANGER_LEVEL.bajo, fechaYHoraDeAparicion: new Date().toISOString() });
    setShowForm(true);
  };
  const startEdit = (c: Curse) => {
    setEditId(c.id);
    reset({
      nombre: c.nombre,
      ubicacionDeAparicion: c.ubicacionDeAparicion,
      grado: c.grado,
      tipo: c.tipo,
      estadoActual: c.estadoActual,
      nivelPeligro: c.nivelPeligro,
      fechaYHoraDeAparicion: c.fechaYHoraDeAparicion,
    });
    setShowForm(true);
  };
  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: Omit<Curse, 'id'> = {
        nombre: values.nombre,
        ubicacionDeAparicion: values.ubicacionDeAparicion,
        grado: values.grado,
        tipo: values.tipo,
        estadoActual: values.estadoActual,
        nivelPeligro: values.nivelPeligro,
        fechaYHoraDeAparicion: values.fechaYHoraDeAparicion,
      };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success(t('toast.curse.updated'));
      } else {
        await create.mutateAsync(payload);
        toast.success(t('toast.curse.created'));
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
        toast.success(t('toast.curse.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  const flat = useMemo(() => (data?.pages ?? []).flatMap(p => p.items), [data]);
  const sortedData = useMemo(() => {
    const base: Curse[] = flat.length
      ? flat
      : Array.isArray(list.data)
        ? list.data
        : (list.data as PagedResponse<Curse> | undefined)?.items ?? [];
    return [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [flat, list.data, sortKey, sortDir]);

  const toggleSort = (key: keyof Curse) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
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
  if (isError) return <div className="p-4 text-red-400">{t('errors.loadCurses')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
  <h1 className="page-title">{t('pages.curses.title')}</h1>
    {canMutate && <Button onClick={openCreate}>{t('ui.new_fem')}</Button>}
      </div>
      {sortedData.length === 0 ? (
  <EmptyState title={t('pages.curses.emptyTitle')} description={canMutate ? t('pages.curses.emptyDescHasPerms') : t('pages.curses.emptyDescNoPerms')} action={canMutate ? <Button onClick={openCreate}>{t('pages.curses.createAction')}</Button> : undefined} />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label={t('ui.id')} active={sortKey==='id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label={t('form.curse.name')} active={sortKey==='nombre'} direction={sortDir} onClick={() => toggleSort('nombre')} /></TH>
                <TH><SortHeader label={t('form.curse.grade')} active={sortKey==='grado'} direction={sortDir} onClick={() => toggleSort('grado')} /></TH>
                <TH><SortHeader label={t('form.curse.type')} active={sortKey==='tipo'} direction={sortDir} onClick={() => toggleSort('tipo')} /></TH>
                <TH><SortHeader label={t('form.curse.state')} active={sortKey==='estadoActual'} direction={sortDir} onClick={() => toggleSort('estadoActual')} /></TH>
                <TH><SortHeader label={t('form.curse.danger')} active={sortKey==='nivelPeligro'} direction={sortDir} onClick={() => toggleSort('nivelPeligro')} /></TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((c) => (
                <tr key={c.id} className="border-b hover:bg-slate-800/40">
                  <TD>{c.id}</TD>
                  <TD>{c.nombre}</TD>
                  <TD>{c.grado}</TD>
                  <TD>{c.tipo}</TD>
                  <TD>{c.estadoActual}</TD>
                  <TD>{c.nivelPeligro}</TD>
                  {canMutate && (
                    <TD className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(c)}>{t('ui.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(c.id)} disabled={remove.isPending}>{t('ui.delete')}</Button>
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
        title={editId ? `${t('ui.edit')} ${t('pages.curses.singular')}` : `${t('ui.new_fem')} ${t('pages.curses.singular')}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
            <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="curse-form">
              {editId ? t('ui.saveChanges') : t('ui.create')}
            </Button>
          </div>
        }
      >
        <form id="curse-form" onSubmit={onSubmit} className="space-y-3">
          <Input label={t('form.curse.name')} placeholder={t('form.curse.name')} {...register('nombre')} />
          {errors.nombre && <p className="text-xs text-red-400">{errors.nombre.message}</p>}
          <Input label={t('form.curse.location')} placeholder={t('form.curse.location')} {...register('ubicacionDeAparicion')} />
          {errors.ubicacionDeAparicion && <p className="text-xs text-red-400">{errors.ubicacionDeAparicion.message}</p>}
          <Select label={t('form.curse.grade')} {...register('grado')}>
            {Object.values(CURSE_GRADE).map((g) => <option key={g} value={g}>{g}</option>)}
          </Select>
          <Select label={t('form.curse.type')} {...register('tipo')}>
            {Object.values(CURSE_TYPE).map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label={t('form.curse.state')} {...register('estadoActual')}>
            {Object.values(CURSE_STATE).map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select label={t('form.curse.danger')} {...register('nivelPeligro')}>
            {Object.values(CURSE_DANGER_LEVEL).map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('pages.curses.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
