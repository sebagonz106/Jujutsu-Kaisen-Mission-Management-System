/**
 * @fileoverview RF-14 Query: Sorcerer Statistics page.
 *
 * Implements analytical query requirement (RF-14): displaying comparative effectiveness statistics
 * for medium and high grade sorcerers with infinite scroll pagination.
 *
 * @module pages/queries/SorcererStatsPage
 */

import { useMemo, useState } from 'react';
import { useSorcererStats } from '../../hooks/useSorcererStats';
import type { SorcererStats } from '../../types/sorcererStats';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, THead, TBody, TH, TD, SortHeader } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { t } from '../../i18n';
import { apiClient } from '../../api/client';

/**
 * SorcererStatsPage component.
 *
 * Features:
 * - Paginated sorcerer statistics with infinite scrolling
 * - Compares effectiveness of medium vs high grade sorcerers
 * - Client-side sorting by any column
 * - Visual effectiveness indicator (progress bar)
 * - Read-only display (no CRUD operations)
 * - Export PDF button
 * - Empty state when no results
 */
export const SorcererStatsPage = () => {
  const [sortKey, setSortKey] = useState<keyof SorcererStats>('porcentajeEfectividad');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch sorcerer statistics with pagination
  const query = useSorcererStats({ pageSize: 20 });
  const data = query.data;
  const isLoading = query.isLoading;
  const isError = query.isError;
  const hasNextPage = query.hasNextPage;
  const isFetchingNextPage = query.isFetchingNextPage;

  // Flatten and sort data client-side
  const stats = useMemo(() => {
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
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const toggleSort = (key: keyof SorcererStats) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleExportPdf = async () => {
    if (stats.length === 0) return;

    setIsExporting(true);
    try {
      console.log('🔵 [PDF] Iniciando descarga de estadísticas...');
      console.log('🔵 [PDF] Petición a: /queries/sorcerer-stats/pdf');
      
      const response = await apiClient.get('/queries/sorcerer-stats/pdf', {
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
        link.setAttribute('download', 'estadisticas-hechiceros.pdf');
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

  const isEmpty = !isLoading && stats.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{t('pages.queries.rf14.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('pages.queries.rf14.desc')}</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleExportPdf}
          disabled={isExporting || stats.length === 0}
        >
          {isExporting ? t('pages.queries.exporting') : t('pages.queries.exportPdf')}
        </Button>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {isLoading ? t('common.loading') : `${stats.length} ${t('common.sorcerersFound')}`}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="card-surface p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        )}

        {isEmpty && (
          <EmptyState
            title={t('pages.queries.rf14.emptyTitle')}
            description={t('pages.queries.rf14.emptyDescDetailed')}
          />
        )}

        {isError && (
          <div className="text-red-400">{t('errors.loadSorcerers')}</div>
        )}

        {/* Table */}
        {!isLoading && stats.length > 0 && (
          <div className="card-surface overflow-hidden">
            <Table>
              <THead>
                <tr>
                  <TH onClick={() => toggleSort('nombre')}>
                    <SortHeader active={sortKey === 'nombre'} direction={sortDir} label={t('common.name')} onClick={() => {}} />
                  </TH>
                  <TH onClick={() => toggleSort('grado')}>
                    <SortHeader active={sortKey === 'grado'} direction={sortDir} label={t('common.grade')} onClick={() => {}} />
                  </TH>
                  <TH onClick={() => toggleSort('misionesTotales')}>
                    <SortHeader active={sortKey === 'misionesTotales'} direction={sortDir} label={t('pages.queries.rf14.totalMissions')} onClick={() => {}} />
                  </TH>
                  <TH onClick={() => toggleSort('misionesExitosas')}>
                    <SortHeader active={sortKey === 'misionesExitosas'} direction={sortDir} label={t('pages.queries.rf14.successfulMissions')} onClick={() => {}} />
                  </TH>
                  <TH onClick={() => toggleSort('porcentajeEfectividad')}>
                    <SortHeader active={sortKey === 'porcentajeEfectividad'} direction={sortDir} label={t('pages.queries.rf14.effectiveness')} onClick={() => {}} />
                  </TH>
                </tr>
              </THead>
              <TBody>
                {stats.map((s) => (
                  <tr key={s.hechiceroId} className="border-b border-slate-700 hover:bg-slate-800/50">
                    <TD className="font-medium text-amber-400">{s.nombre}</TD>
                    <TD>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        s.grado.toLowerCase().includes('alto') ? 'bg-purple-900/50 text-purple-300' :
                        s.grado.toLowerCase().includes('medio') ? 'bg-blue-900/50 text-blue-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {s.grado}
                      </span>
                    </TD>
                    <TD className="text-center">{s.misionesTotales}</TD>
                    <TD className="text-center text-green-400">{s.misionesExitosas}</TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-700 rounded-full h-2">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                            style={{ width: `${s.porcentajeEfectividad}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-200 w-12 text-right">
                          {s.porcentajeEfectividad.toFixed(1)}%
                        </span>
                      </div>
                    </TD>
                  </tr>
                ))}
              </TBody>
            </Table>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center p-4 border-t border-slate-700">
                <Button onClick={loadMore} disabled={isFetchingNextPage} size="sm">
                  {isFetchingNextPage ? t('common.loading') : t('common.loadMore')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
