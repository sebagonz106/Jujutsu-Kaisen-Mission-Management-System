/**
 * @fileoverview RF-13 Query: Missions in Date Range page.
 *
 * Implements analytical query requirement (RF-13): filtering missions within a specified date range.
 * Features date range selection, paginated results with client-side sorting, and export capabilities.
 *
 * @module pages/queries/MissionsInRangePage
 */

import { useMemo, useState } from 'react';
import { useInfiniteMissionsInRange } from '../../hooks/useInfiniteMissionsInRange';
import type { MissionInRange } from '../../types/missionInRange';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, THead, TBody, TH, TD, SortHeader } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '../../i18n';
import { apiClient } from '../../api/client';

/**
 * Zod schema for query parameters validation.
 */
const querySchema = z.object({
  startDate: z.string().min(1, 'Fecha de inicio es requerida'),
  endDate: z.string().min(1, 'Fecha de fin es requerida'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['endDate'],
});

type QueryFormValues = z.infer<typeof querySchema>;

/**
 * MissionsInRangePage component.
 *
 * Features:
 * - Date range selection with validation
 * - Paginated results with infinite scrolling
 * - Client-side sorting by any column
 * - Read-only table (no CRUD operations)
 * - Export PDF button (disabled, coming soon)
 * - Empty state when no results
 *
 * Pattern follows CursesByStatePage structure for consistency.
 */
export const MissionsInRangePage = () => {
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [sortKey, setSortKey] = useState<keyof MissionInRange>('misionId');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { register, handleSubmit, formState: { errors } } = useForm<QueryFormValues>({
    resolver: zodResolver(querySchema),
  });

  // Only fetch if date range is selected
  const { query } = useInfiniteMissionsInRange({
    startDate: dateRange?.startDate ?? '',
    endDate: dateRange?.endDate ?? '',
    pageSize: 20,
  });

  const shouldFetch = dateRange !== null;
  const data = shouldFetch ? query.data : undefined;
  const isLoading = shouldFetch ? query.isLoading : false;
  const isError = shouldFetch ? query.isError : false;
  const hasNextPage = shouldFetch ? query.hasNextPage : false;
  const isFetchingNextPage = shouldFetch ? query.isFetchingNextPage : false;

  // Flatten and sort data client-side
  const missions = useMemo(() => {
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

  const toggleSort = (key: keyof MissionInRange) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!dateRange || missions.length === 0) return;

    setIsExporting(true);
    try {
      console.log('🔵 [PDF] Iniciando descarga de misiones en rango...');
      console.log('🔵 [PDF] Rango:', dateRange.startDate, '-', dateRange.endDate);
      console.log('🔵 [PDF] Petición a: /queries/missions-in-range/pdf');
      
      const response = await apiClient.get('/queries/missions-in-range/pdf', {
        params: {
          desde: dateRange.startDate,
          hasta: dateRange.endDate,
        },
        responseType: 'blob',
      });

      console.log('🟢 [PDF] Respuesta recibida:', {
        status: response.status,
        headers: response.headers,
        dataType: typeof response.data,
        dataSize: response.data?.size,
      });

      if (response.status === 200 && response.data && response.data.size > 0) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `misiones-en-rango-${dateRange.startDate}-${dateRange.endDate}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log('✅ [PDF] Descarga completada');
      } else {
        console.warn('⚠️ [PDF] Respuesta vacía o inválida:', response.data);
      }
    } catch (error) {
      console.error('❌ [PDF] Error exporting PDF:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const loadMore = async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await query.fetchNextPage();
  };

  const onSubmit = (values: QueryFormValues) => {
    setDateRange(values);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{t('pages.queries.rf13.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('pages.queries.rf13.desc')}</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleExportPdf}
          disabled={isExporting || !dateRange || missions.length === 0}
        >
          {isExporting ? t('pages.queries.exporting') : t('pages.queries.exportPdf')}
        </Button>
      </div>

      {/* Query Parameters Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card-surface p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('pages.queries.rf13.startDateLabel')}
            </label>
            <Input type="date" {...register('startDate')} />
            {errors.startDate && <p className="text-red-400 text-sm mt-1">{errors.startDate.message}</p>}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('pages.queries.rf13.endDateLabel')}
            </label>
            <Input type="date" {...register('endDate')} />
            {errors.endDate && <p className="text-red-400 text-sm mt-1">{errors.endDate.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('pages.queries.rf13.searching') : t('pages.queries.rf13.searchButton')}
          </Button>
        </div>
      </form>

      {/* Results Section */}
      {!shouldFetch ? (
        <EmptyState
          title="Selecciona un rango de fechas"
          description="Elige las fechas de inicio y fin para consultar las misiones"
        />
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <div className="text-red-400">{t('errors.loadMissions')}</div>
      ) : missions.length === 0 ? (
        <EmptyState
          title={t('pages.queries.rf13.emptyTitle')}
          description={t('pages.queries.rf13.emptyDesc')}
        />
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <TH><SortHeader label="Maldición" active={sortKey==='maldicion'} direction={sortDir} onClick={() => toggleSort('maldicion')} /></TH>
                <TH><SortHeader label="Ubicación" active={sortKey==='ubicacion'} direction={sortDir} onClick={() => toggleSort('ubicacion')} /></TH>
                <TH>Hechiceros</TH>
                <TH>Técnicas</TH>
                <TH><SortHeader label="Fecha Inicio" active={sortKey==='fechaInicio'} direction={sortDir} onClick={() => toggleSort('fechaInicio')} /></TH>
                <TH><SortHeader label="Fecha Fin" active={sortKey==='fechaFin'} direction={sortDir} onClick={() => toggleSort('fechaFin')} /></TH>
              </tr>
            </THead>
            <TBody>
              {missions.map((m, idx) => (
                <tr key={`${m.misionId}-${idx}`}>
                  <TD className="font-medium text-amber-400">{m.maldicion || '-'}</TD>
                  <TD>{m.ubicacion}</TD>
                  <TD>
                    <div className="flex flex-wrap gap-1">
                      {m.hechiceros.map((h, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-purple-900/30 text-purple-300 text-xs rounded">
                          {h}
                        </span>
                      ))}
                    </div>
                  </TD>
                  <TD>
                    <div className="flex flex-wrap gap-1">
                      {m.tecnicas.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-900/30 text-blue-300 text-xs rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </TD>
                  <TD className="tabular-nums">{new Date(m.fechaInicio).toLocaleDateString()}</TD>
                  <TD className="tabular-nums">{m.fechaFin ? new Date(m.fechaFin).toLocaleDateString() : t('common.inProgress')}</TD>
                </tr>
              ))}
            </TBody>
          </Table>

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center">
              <Button onClick={loadMore} disabled={isFetchingNextPage} variant="secondary">
                {isFetchingNextPage ? t('ui.loading') : t('ui.loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
