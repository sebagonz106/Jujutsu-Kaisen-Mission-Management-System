/**
 * @fileoverview RF-12 Query: Curses by State page.
 *
 * Implements the first analytical query requirement (RF-12): filtering curses by their current state.
 * Features parameter selection, paginated results with client-side sorting, and export capabilities.
 *
 * @module pages/queries/CursesByStatePage
 */

import { useMemo, useState } from 'react';
import { useInfiniteCursesByState } from '../../hooks/useInfiniteCursesByState';
import type { Curse, CurseState } from '../../types/curse';
import { CURSE_STATE } from '../../types/curse';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, THead, TBody, TH, TD, SortHeader } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '../../i18n';
import { curseStateLabel, curseGradeLabel, curseTypeLabel, curseDangerLabel } from '../../utils/enumLabels';

/**
 * Zod schema for query parameters validation.
 */
const querySchema = z.object({
  state: z.union([
    z.literal(CURSE_STATE.activa),
    z.literal(CURSE_STATE.en_proceso_de_exorcismo),
    z.literal(CURSE_STATE.exorcisada),
  ]),
});

type QueryFormValues = z.infer<typeof querySchema>;

/**
 * CursesByStatePage component.
 *
 * Features:
 * - State selection dropdown using Zod validation
 * - Paginated results with infinite scrolling
 * - Client-side sorting by any column
 * - Read-only table (no CRUD operations)
 * - Export PDF button (disabled, coming soon)
 * - Empty state when no results
 *
 * Pattern follows SorcerersPage structure for consistency.
 */
export const CursesByStatePage = () => {
  const [selectedState, setSelectedState] = useState<CurseState | null>(null);
  const [sortKey, setSortKey] = useState<keyof Curse>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { register, handleSubmit, control, formState: { errors } } = useForm<QueryFormValues>({
    resolver: zodResolver(querySchema),
  });

  // Only fetch if state is selected
  const { query } = useInfiniteCursesByState({
    state: selectedState ?? CURSE_STATE.activa,
    pageSize: 20,
  });

  const shouldFetch = selectedState !== null;
  const data = shouldFetch ? query.data : undefined;
  const isLoading = shouldFetch ? query.isLoading : false;
  const isError = shouldFetch ? query.isError : false;
  const hasNextPage = shouldFetch ? query.hasNextPage : false;
  const isFetchingNextPage = shouldFetch ? query.isFetchingNextPage : false;

  // Flatten and sort data client-side
  const curses = useMemo(() => {
    const flat = (data?.pages ?? []).flatMap((p) => p.items);
    return [...flat].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        cmp = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const toggleSort = (key: keyof Curse) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const loadMore = async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await query.fetchNextPage();
  };

  const onSubmit = (values: QueryFormValues) => {
    setSelectedState(values.state);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('pages.queries.rf12.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('pages.queries.rf12.desc')}</p>
        </div>
        <Button
          variant="outline"
          disabled
          title={t('pages.recentActions.comingSoon')}
        >
          {t('pages.recentActions.exportPdf')}
        </Button>
      </div>

      {/* Query Parameters Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card-surface p-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('pages.queries.rf12.paramLabel')}
            </label>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={[
                    { value: CURSE_STATE.activa, label: curseStateLabel(CURSE_STATE.activa) },
                    { value: CURSE_STATE.en_proceso_de_exorcismo, label: curseStateLabel(CURSE_STATE.en_proceso_de_exorcismo) },
                    { value: CURSE_STATE.exorcisada, label: curseStateLabel(CURSE_STATE.exorcisada) },
                  ]}
                />
              )}
            />
            {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('pages.queries.rf12.searching') : t('pages.queries.rf12.searchButton')}
          </Button>
        </div>
      </form>

      {/* Results Section */}
      {!shouldFetch ? (
        <EmptyState
          title="Selecciona un estado"
          description="Elige el estado de las maldiciones que deseas consultar"
        />
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <div className="text-red-400">{t('errors.loadCurses')}</div>
      ) : curses.length === 0 ? (
        <EmptyState
          title={t('pages.queries.rf12.emptyTitle')}
          description={t('pages.queries.rf12.emptyDesc')}
        />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <SortHeader field="id" current={sortKey} dir={sortDir} onClick={toggleSort}>
                  {t('ui.id')}
                </SortHeader>
                <SortHeader field="nombre" current={sortKey} dir={sortDir} onClick={toggleSort}>
                  {t('form.curse.name')}
                </SortHeader>
                <SortHeader field="grado" current={sortKey} dir={sortDir} onClick={toggleSort}>
                  {t('form.curse.grade')}
                </SortHeader>
                <SortHeader field="tipo" current={sortKey} dir={sortDir} onClick={toggleSort}>
                  {t('form.curse.type')}
                </SortHeader>
                <SortHeader field="nivelPeligro" current={sortKey} dir={sortDir} onClick={toggleSort}>
                  {t('form.curse.danger')}
                </SortHeader>
                <SortHeader field="ubicacionDeAparicion" current={sortKey} dir={sortDir} onClick={toggleSort}>
                  {t('form.curse.location')}
                </SortHeader>
                <SortHeader field="fechaYHoraDeAparicion" current={sortKey} dir={sortDir} onClick={toggleSort}>
                  Fecha Aparición
                </SortHeader>
              </tr>
            </THead>
            <TBody>
              {curses.map((c) => (
                <tr key={c.id}>
                  <TD>{c.id}</TD>
                  <TD>{c.nombre}</TD>
                  <TD>{curseGradeLabel(c.grado)}</TD>
                  <TD>{curseTypeLabel(c.tipo)}</TD>
                  <TD>{curseDangerLabel(c.nivelPeligro)}</TD>
                  <TD>{c.ubicacionDeAparicion}</TD>
                  <TD className="tabular-nums">{new Date(c.fechaYHoraDeAparicion).toLocaleString()}</TD>
                </tr>
              ))}
            </TBody>
          </Table>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={!hasNextPage || isFetchingNextPage}
              >
                {isFetchingNextPage ? t('ui.loadingMore') : t('ui.loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
