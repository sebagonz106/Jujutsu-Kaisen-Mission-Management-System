import { useState, useMemo } from 'react';
import { useInfiniteSorcerers } from '../../hooks/useInfiniteSorcerers';
import { useSorcerers } from '../../hooks/useSorcerers';
import type { PagedResponse } from '../../api/pagedApi';
import type { Sorcerer } from '../../types/sorcerer';
import { SORCERER_GRADE, SORCERER_STATUS } from '../../types/sorcerer';
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
  name: z.string().min(2, t('form.validation.nameTooShort')),
  grado: z.union([
    z.literal(SORCERER_GRADE.estudiante),
    z.literal(SORCERER_GRADE.aprendiz),
    z.literal(SORCERER_GRADE.medio),
    z.literal(SORCERER_GRADE.alto),
    z.literal(SORCERER_GRADE.especial),
  ]),
  experiencia: z.coerce.number().min(0, t('form.validation.nonNegative')),
  estado: z.union([
    z.literal(SORCERER_STATUS.activo),
    z.literal(SORCERER_STATUS.lesionado),
    z.literal(SORCERER_STATUS.recuperandose),
    z.literal(SORCERER_STATUS.baja),
    z.literal(SORCERER_STATUS.inactivo),
  ]),
  tecnicaPrincipal: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export const SorcerersPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteSorcerers({ pageSize: 20 });
  // Use legacy hook only for mutations & cache invalidation.
  const { list, create, update, remove } = useSorcerers();
  const { user } = useAuth();
  const canMutate = canMutateByRole(user);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Sorcerer>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      grado: SORCERER_GRADE.estudiante,
      experiencia: 0,
      estado: SORCERER_STATUS.activo,
      tecnicaPrincipal: '',
    },
  });

  const openCreate = () => {
    setEditId(null);
    reset({ name: '', grado: SORCERER_GRADE.estudiante, experiencia: 0, estado: SORCERER_STATUS.activo, tecnicaPrincipal: '' });
    setShowForm(true);
  };
  const startEdit = (s: Sorcerer) => {
    setEditId(s.id);
    reset({
      name: s.name,
      grado: s.grado,
      experiencia: s.experiencia,
      estado: s.estado,
      tecnicaPrincipal: s.tecnicaPrincipal ?? '',
    });
    setShowForm(true);
  };
  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editId) {
        await update.mutateAsync({ id: editId, patch: values });
        toast.success(t('toast.sorcerer.updated'));
      } else {
        await create.mutateAsync(values);
        toast.success(t('toast.sorcerer.created'));
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
        toast.success(t('toast.sorcerer.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  const flat = useMemo(() => (data?.pages ?? []).flatMap((p) => p.items), [data]);
  const sortedData = useMemo(() => {
    const base: Sorcerer[] = flat.length
      ? flat
      : Array.isArray(list.data)
        ? list.data
        : (list.data as PagedResponse<Sorcerer> | undefined)?.items ?? [];
    return [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [flat, list.data, sortKey, sortDir]);

  const toggleSort = (key: keyof Sorcerer) => {
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
  if (isError) return <div className="p-4 text-red-400">{t('errors.loadSorcerers')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
  <h1 className="page-title">{t('pages.sorcerers.title')}</h1>
    {canMutate && <Button onClick={openCreate}>{t('ui.new_masc')}</Button>}
      </div>
  {sortedData.length === 0 ? (
        <EmptyState
          title={t('pages.sorcerers.emptyTitle')}
          description={canMutate ? t('pages.sorcerers.emptyDescHasPerms') : t('pages.sorcerers.emptyDescNoPerms')}
          action={canMutate ? <Button onClick={openCreate}>{t('pages.sorcerers.createAction')}</Button> : undefined}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label={t('ui.id')} active={sortKey==='id'} direction={sortDir} onClick={() => toggleSort('id')} /></TH>
                <TH><SortHeader label={t('form.labels.name')} active={sortKey==='name'} direction={sortDir} onClick={() => toggleSort('name')} /></TH>
                <TH><SortHeader label={t('form.labels.grade')} active={sortKey==='grado'} direction={sortDir} onClick={() => toggleSort('grado')} /></TH>
                <TH><SortHeader label={t('form.labels.experience')} active={sortKey==='experiencia'} direction={sortDir} onClick={() => toggleSort('experiencia')} /></TH>
                <TH><SortHeader label={t('form.labels.state')} active={sortKey==='estado'} direction={sortDir} onClick={() => toggleSort('estado')} /></TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((s) => (
                <tr key={s.id} className="border-b hover:bg-slate-800/40">
                  <TD>{s.id}</TD>
                  <TD>{s.name}</TD>
                  <TD>{s.grado}</TD>
                  <TD>{s.experiencia}</TD>
                  <TD>{s.estado}</TD>
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
  title={editId ? `${t('ui.edit')} ${t('pages.sorcerers.singular')}` : `${t('ui.new_masc')} ${t('pages.sorcerers.singular')}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
            <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="sorcerer-form">
              {editId ? t('ui.saveChanges') : t('ui.create')}
            </Button>
          </div>
        }
      >
        <form id="sorcerer-form" onSubmit={onSubmit} className="space-y-3">
          <Input label={t('form.labels.name')} placeholder={t('form.labels.name')} {...register('name')} />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          <Select label={t('form.labels.grade')} {...register('grado')}>
            {Object.values(SORCERER_GRADE).map((g) => <option key={g} value={g}>{g}</option>)}
          </Select>
          <Input label={t('form.labels.experience')} type="number" {...register('experiencia', { valueAsNumber: true })} />
          {errors.experiencia && <p className="text-xs text-red-400">{errors.experiencia.message}</p>}
            <Select label={t('form.labels.state')} {...register('estado')}>
            {Object.values(SORCERER_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Input label={t('form.labels.mainTechnique')} placeholder={t('form.placeholders.tecnicaprincipal')} {...register('tecnicaPrincipal')} />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('pages.sorcerers.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
