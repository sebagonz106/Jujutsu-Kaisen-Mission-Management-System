/**
 * @fileoverview Mastered Techniques management page component.
 * Provides full CRUD interface for mastered techniques (TecnicaMalditaDominada) with sortable table,
 * modal forms, and permission-based access control.
 * @module pages/mastered-techniques/MasteredTechniquesPage
 */

import { useMemo, useState } from 'react';
import { useInfiniteMasteredTechniques } from '../../hooks/useInfiniteMasteredTechniques';
import { useMasteredTechniques } from '../../hooks/useMasteredTechniques';
import { useSorcerers } from '../../hooks/useSorcerers';
import { useTechniques } from '../../hooks/useTechniques';
import type { MasteredTechnique, MasteredTechniquePayload } from '../../types/masteredTechnique';
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
  hechiceroId: z.coerce.number().min(1, t('form.validation.required')),
  tecnicaMalditaId: z.coerce.number().min(1, t('form.validation.required')),
  nivelDeDominio: z.coerce.number().min(0).max(100, t('form.validation.range0to100')),
});

type FormValues = z.infer<typeof schema>;

export const MasteredTechniquesPage = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteMasteredTechniques({ pageSize: 20 });
  const { create, update, remove } = useMasteredTechniques();
  const { list: sorcerersList } = useSorcerers();
  const { list: techniquesList } = useTechniques();
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

  const techniques = useMemo(() => {
    const d = techniquesList.data;
    return Array.isArray(d) ? d : d?.items ?? [];
  }, [techniquesList.data]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { hechiceroId: 0, tecnicaMalditaId: 0, nivelDeDominio: 0 },
  });

  const openCreate = () => {
    setEditId(null);
    reset({ hechiceroId: 0, tecnicaMalditaId: 0, nivelDeDominio: 0 });
    setShowForm(true);
  };

  const startEdit = (mt: MasteredTechnique) => {
    setEditId(mt.id);
    reset({
      hechiceroId: mt.hechiceroId,
      tecnicaMalditaId: mt.tecnicaMalditaId,
      nivelDeDominio: mt.nivelDeDominio,
    });
    setShowForm(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: MasteredTechniquePayload = {
        hechiceroId: values.hechiceroId,
        tecnicaMalditaId: values.tecnicaMalditaId,
        nivelDeDominio: values.nivelDeDominio,
      };
      if (editId) {
        await update.mutateAsync({ id: editId, patch: payload });
        toast.success(t('toast.masteredTechnique.updated'));
      } else {
        await create.mutateAsync(payload);
        toast.success(t('toast.masteredTechnique.created'));
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
        toast.success(t('toast.masteredTechnique.deleted'));
      } catch {
        toast.error(t('toast.deleteError'));
      }
      setDeleteId(null);
    }
  };

  const sortedData = useMemo(() => {
    const base: MasteredTechnique[] = data?.pages.flatMap((p) => p.items) ?? [];
    return [...base].sort((a, b) => {
      let av: string | number = 0;
      let bv: string | number = 0;
      if (sortKey === 'id') { av = a.id; bv = b.id; }
      else if (sortKey === 'hechicero') { av = a.hechicero?.name ?? ''; bv = b.hechicero?.name ?? ''; }
      else if (sortKey === 'tecnica') { av = a.tecnicaMaldita?.nombre ?? ''; bv = b.tecnicaMaldita?.nombre ?? ''; }
      else if (sortKey === 'nivelDeDominio') { av = a.nivelDeDominio; bv = b.nivelDeDominio; }
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
  if (isError) return <div className="p-4 text-red-400">{t('errors.loadMasteredTechniques')}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t('pages.masteredTechniques.title')}</h1>
        {canMutate && <Button onClick={openCreate}>{t('ui.new_fem')}</Button>}
      </div>
      {sortedData.length === 0 ? (
        <EmptyState
          title={t('pages.masteredTechniques.emptyTitle')}
          description={canMutate ? t('pages.masteredTechniques.emptyDescHasPerms') : t('pages.masteredTechniques.emptyDescNoPerms')}
          action={canMutate ? <Button onClick={openCreate}>{t('pages.masteredTechniques.createAction')}</Button> : undefined}
        />
      ) : (
        <div className="card-surface p-4 overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label={t('form.labels.sorcerer')} active={sortKey === 'hechicero'} direction={sortDir} onClick={() => toggleSort('hechicero')} /></TH>
                <TH><SortHeader label={t('form.labels.technique')} active={sortKey === 'tecnica'} direction={sortDir} onClick={() => toggleSort('tecnica')} /></TH>
                <TH><SortHeader label={t('form.labels.masteryLevel')} active={sortKey === 'nivelDeDominio'} direction={sortDir} onClick={() => toggleSort('nivelDeDominio')} /></TH>
                {canMutate && <TH>{t('ui.actions')}</TH>}
              </tr>
            </THead>
            <TBody>
              {sortedData.map((mt) => (
                <tr key={mt.id} className="border-b hover:bg-slate-800/40">
                  <TD>{mt.hechicero?.name ?? '-'}</TD>
                  <TD>{mt.tecnicaMaldita?.nombre ?? '-'}</TD>
                  <TD>{mt.nivelDeDominio}%</TD>
                  {canMutate && (
                    <TD className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(mt)}>{t('ui.edit')}</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(mt.id)} disabled={remove.isPending}>{t('ui.delete')}</Button>
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
        title={editId ? `${t('ui.edit')} ${t('pages.masteredTechniques.singular')}` : `${t('ui.new_fem')} ${t('pages.masteredTechniques.singular')}`}
        footer={<div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowForm(false)}>{t('ui.cancel')}</Button>
          <Button disabled={!canMutate || isSubmitting || create.isPending || update.isPending} type="submit" form="mastered-technique-form">
            {editId ? t('ui.saveChanges') : t('ui.create')}
          </Button>
        </div>}
      >
        <form id="mastered-technique-form" onSubmit={onSubmit} className="space-y-3">
          <Select label={t('form.labels.sorcerer')} {...register('hechiceroId')}>
            <option value={0}>{t('form.placeholders.selectSorcerer')}</option>
            {sorcerers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          {errors.hechiceroId && <p className="text-xs text-red-400">{errors.hechiceroId.message}</p>}

          <Select label={t('form.labels.technique')} {...register('tecnicaMalditaId')}>
            <option value={0}>{t('form.placeholders.selectTechnique')}</option>
            {techniques.map((tech) => (
              <option key={tech.id} value={tech.id}>{tech.nombre}</option>
            ))}
          </Select>
          {errors.tecnicaMalditaId && <p className="text-xs text-red-400">{errors.tecnicaMalditaId.message}</p>}

          <Input label={t('form.labels.masteryLevel')} type="number" min={0} max={100} step={0.1} {...register('nivelDeDominio')} />
          {errors.nivelDeDominio && <p className="text-xs text-red-400">{errors.nivelDeDominio.message}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null && canMutate}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('pages.masteredTechniques.deleteTitle')}
        description={t('pages.missions.cannotUndo')}
        confirmText={t('ui.delete')}
      />
    </div>
  );
};
