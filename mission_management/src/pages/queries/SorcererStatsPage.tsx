/**
 * @fileoverview RF-14 Query: Sorcerer Statistics page.
 *
 * Implements analytical query requirement (RF-14): displaying comprehensive statistics for a selected sorcerer.
 * Features sorcerer selection, detailed statistics with visual indicators, and export capabilities.
 *
 * @module pages/queries/SorcererStatsPage
 */

import { useState, useEffect } from 'react';
import { useSorcererStats } from '../../hooks/useSorcererStats';
import { useInfiniteSorcerers } from '../../hooks/useInfiniteSorcerers';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '../../i18n';

/**
 * Zod schema for query parameters validation.
 */
const querySchema = z.object({
  sorcererId: z.number().min(1, 'Debes seleccionar un hechicero'),
});

type QueryFormValues = z.infer<typeof querySchema>;

/**
 * SorcererStatsPage component.
 *
 * Features:
 * - Sorcerer selection dropdown populated from API
 * - Single sorcerer statistics display (not paginated)
 * - Visual effectiveness indicator (progress bar)
 * - Read-only display (no CRUD operations)
 * - Export PDF button (disabled, coming soon)
 * - Empty state when no sorcerer selected
 *
 * Pattern follows CursesByStatePage structure for consistency.
 */
export const SorcererStatsPage = () => {
  const [selectedSorcererId, setSelectedSorcererId] = useState<number | null>(null);

  const { handleSubmit, control, formState: { errors } } = useForm<QueryFormValues>({
    resolver: zodResolver(querySchema),
  });

  // Fetch all sorcerers for dropdown
  const sorcerersQuery = useInfiniteSorcerers({ pageSize: 100 });
  const sorcerers = (sorcerersQuery.data?.pages ?? []).flatMap((p) => p.items);

  // Fetch selected sorcerer's statistics
  const { query: statsQuery } = useSorcererStats({ sorcererId: selectedSorcererId });

  const shouldFetch = selectedSorcererId !== null;
  const stats = shouldFetch ? statsQuery.data : undefined;
  const isLoading = shouldFetch ? statsQuery.isLoading : false;
  const isError = shouldFetch ? statsQuery.isError : false;

  // Load more sorcerers if needed
  useEffect(() => {
    if (sorcerersQuery.hasNextPage && !sorcerersQuery.isFetchingNextPage) {
      sorcerersQuery.fetchNextPage();
    }
  }, [sorcerersQuery]);

  const onSubmit = (values: QueryFormValues) => {
    setSelectedSorcererId(values.sorcererId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{t('pages.queries.rf14.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('pages.queries.rf14.desc')}</p>
        </div>
        <Button
          variant="secondary"
          disabled
          title={t('pages.recentActions.comingSoon')}
        >
          {t('pages.recentActions.exportPdf')}
        </Button>
      </div>

      {/* Query Parameters Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card-surface p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('pages.queries.rf14.paramLabel')}
            </label>
            <Controller
              name="sorcererId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={sorcerersQuery.isLoading}
                >
                  <option value="">Selecciona un hechicero</option>
                  {sorcerers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.grado}
                    </option>
                  ))}
                </Select>
              )}
            />
            {errors.sorcererId && <p className="text-red-400 text-sm mt-1">{errors.sorcererId.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading || sorcerersQuery.isLoading}>
            {isLoading ? t('pages.queries.rf14.searching') : t('pages.queries.rf14.searchButton')}
          </Button>
        </div>
      </form>

      {/* Results Section */}
      {!shouldFetch ? (
        <EmptyState
          title="Selecciona un hechicero"
          description="Elige el hechicero del que deseas consultar las estadísticas"
        />
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <div className="text-red-400">{t('errors.loadSorcerers')}</div>
      ) : !stats ? (
        <EmptyState
          title={t('pages.queries.rf14.emptyTitle')}
          description={t('pages.queries.rf14.emptyDesc')}
        />
      ) : (
        <div className="card-surface p-6 space-y-6">
          {/* Header */}
          <div className="border-b border-slate-700 pb-4">
            <h2 className="text-2xl font-cinzel text-amber-400">{stats.nombre}</h2>
            <p className="text-slate-400 text-sm mt-1">Grado: {stats.grado}</p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Missions */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Misiones Totales</div>
              <div className="text-3xl font-bold text-amber-400">{stats.misionesTotales}</div>
            </div>

            {/* Successful Missions */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Misiones Exitosas</div>
              <div className="text-3xl font-bold text-green-400">{stats.misionesExitosas}</div>
            </div>

            {/* Effectiveness Percentage */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Porcentaje de Efectividad</div>
              <div className="text-3xl font-bold text-purple-400">{stats.porcentajeEfectividad.toFixed(1)}%</div>
            </div>
          </div>

          {/* Effectiveness Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Efectividad</span>
              <span className="text-slate-300">{stats.porcentajeEfectividad.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
                style={{ width: `${stats.porcentajeEfectividad}%` }}
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="border-t border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">ID del Hechicero:</span>
              <span className="text-slate-200 font-mono">{stats.hechiceroId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tasa de Éxito:</span>
              <span className="text-slate-200">
                {stats.misionesExitosas} / {stats.misionesTotales}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
