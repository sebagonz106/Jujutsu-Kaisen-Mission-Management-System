/**
 * @fileoverview Ranking Page: Top 3 Sorcerers by Level and Location.
 *
 * Displays the top 3 sorcerers by success rate for each mission urgency level
 * within a selected location, without pagination (deterministic small dataset).
 *
 * @module pages/queries/RankingPage
 */

import { useMemo, useState } from 'react';
import { useInfiniteLocations } from '../../hooks/useInfiniteLocations';
import { useRankingSorcerers } from '../../hooks/useRankingSorcerers';
import type { RankingHechicero } from '../../types/rankingHechicero';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, THead, TBody, TH, TD, SortHeader } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { t } from '../../i18n';
import { apiClient } from '../../api/client';

/**
 * Zod schema for query parameters validation.
 */
const querySchema = z.object({
  locationId: z.number().int().positive('Debes seleccionar una ubicación'),
});

type QueryFormValues = z.infer<typeof querySchema>;

/**
 * Get urgency level color badge.
 */
const getLevelColor = (nivel: string) => {
  const lower = nivel.toLowerCase();
  if (lower.includes('critica')) return 'bg-red-100 text-red-800';
  if (lower.includes('urgente')) return 'bg-orange-100 text-orange-800';
  if (lower.includes('normal')) return 'bg-blue-100 text-blue-800';
  return 'bg-slate-100 text-slate-800';
};

/**
 * RankingPage component.
 *
 * Features:
 * - Location selector dropdown
 * - Groups results by mission urgency level
 * - Shows top 3 sorcerers per level sorted by success rate
 * - Client-side sorting by any column
 * - Success rate visualization with percentage
 * - Read-only table (no CRUD operations)
 * - Export PDF button
 * - Empty state handling
 * - No pagination (deterministic small dataset ~9 rows max)
 *
 * Pattern: Select + Static Table with Sorting
 */
export const RankingPage = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof RankingHechicero>('porcentajeExito');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [isExporting, setIsExporting] = useState(false);

  const { handleSubmit } = useForm<QueryFormValues>({
    resolver: zodResolver(querySchema),
    defaultValues: { locationId: undefined },
  });

  // Fetch all locations for dropdown
  const locationsQuery = useInfiniteLocations({ pageSize: 100 });
  const locations = (locationsQuery.data?.pages ?? []).flatMap((p) => p.items);

  // Fetch ranking for selected location
  const { data: rankingData, isLoading, isError } = useRankingSorcerers({
    locationId: selectedLocationId ?? 0,
    enabled: selectedLocationId !== null,
  });

  const ranking = useMemo(() => rankingData ?? [], [rankingData]);

  // Sort and group by level
  const groupedRanking = useMemo(() => {
    const sorted = [...ranking].sort((a, b) => {
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

    // Group by nivel
    const grouped = new Map<string, RankingHechicero[]>();
    sorted.forEach((item) => {
      const nivel = item.nivelMision;
      if (!grouped.has(nivel)) {
        grouped.set(nivel, []);
      }
      grouped.get(nivel)!.push(item);
    });

    return grouped;
  }, [ranking, sortKey, sortDir]);

  const toggleSort = (key: keyof RankingHechicero) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const onSubmit = (values: QueryFormValues) => {
    setSelectedLocationId(values.locationId);
  };

  const handleExportPdf = async () => {
    if (!selectedLocationId || ranking.length === 0) return;

    setIsExporting(true);
    try {
      console.log('🔵 [PDF] Iniciando descarga de ranking...');
      console.log('🔵 [PDF] Ubicación ID:', selectedLocationId);
      console.log('🔵 [PDF] Petición a: /sorcerer-ranking/pdf');
      
      const response = await apiClient.get('/sorcerer-ranking/pdf', {
        params: { ubicacionId: selectedLocationId },
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
        link.setAttribute('download', `ranking-ubicacion-${selectedLocationId}.pdf`);
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

  const shouldFetch = selectedLocationId !== null;
  const isEmpty = shouldFetch && !isLoading && ranking.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{t('pages.queries.sorcererRanking.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('pages.queries.sorcererRanking.desc')}</p>
        </div>
      </div>

      {/* Location Select Form */}
      <div className="card-surface p-6 space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              {t('pages.queries.sorcererRanking.selectLocation')}
            </label>
            <select
              value={selectedLocationId?.toString() || ''}
              onChange={(e) => {
                const id = e.target.value ? parseInt(e.target.value) : null;
                setSelectedLocationId(id);
              }}
              className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">-- {t('pages.queries.sorcererRanking.selectPlaceholder')} --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nombre}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {shouldFetch && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {isLoading ? t('common.loading') : `${ranking.length} ${t('pages.queries.sorcererRanking.sorcerersFound')}`}
            </div>
            <Button
              onClick={handleExportPdf}
              disabled={isExporting || ranking.length === 0}
              variant="secondary"
              size="sm"
            >
              {isExporting ? t('common.loading') : '📄 PDF'}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="card-surface overflow-hidden">
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            </div>
          )}

          {isEmpty && <EmptyState title={t('common.noResults')} />}

          {/* Grouped Table by Level */}
          {!isLoading && ranking.length > 0 && (
            <div className="space-y-4">
              {Array.from(groupedRanking.entries()).map(([nivel, sorcerers]) => (
                <div key={nivel} className="card-surface overflow-hidden">
                  {/* Level Header */}
                  <div className={`px-6 py-3 ${
                    nivel.toLowerCase().includes('critica') ? 'bg-red-900/50 text-red-200' :
                    nivel.toLowerCase().includes('urgente') ? 'bg-orange-900/50 text-orange-200' :
                    'bg-blue-900/50 text-blue-200'
                  }`}>
                    <h3 className="font-semibold text-sm">
                      {t('pages.queries.sorcererRanking.level')}: {nivel}
                    </h3>
                  </div>

                  {/* Level Table */}
                  <Table>
                    <THead>
                      <tr>
                        <TH onClick={() => toggleSort('hechiceroId')}>
                          <SortHeader active={sortKey === 'hechiceroId'} direction={sortDir} label={t('pages.queries.sorcererRanking.sorcererId')} onClick={() => {}} />
                        </TH>
                        <TH onClick={() => toggleSort('nombreHechicero')}>
                          <SortHeader active={sortKey === 'nombreHechicero'} direction={sortDir} label={t('pages.queries.sorcererRanking.name')} onClick={() => {}} />
                        </TH>
                        <TH onClick={() => toggleSort('totalMisiones')}>
                          <SortHeader active={sortKey === 'totalMisiones'} direction={sortDir} label={t('pages.queries.sorcererRanking.totalMissions')} onClick={() => {}} />
                        </TH>
                        <TH onClick={() => toggleSort('misionesExitosas')}>
                          <SortHeader active={sortKey === 'misionesExitosas'} direction={sortDir} label={t('pages.queries.sorcererRanking.successfulMissions')} onClick={() => {}} />
                        </TH>
                        <TH onClick={() => toggleSort('porcentajeExito')}>
                          <SortHeader active={sortKey === 'porcentajeExito'} direction={sortDir} label={t('pages.queries.sorcererRanking.successRate')} onClick={() => {}} />
                        </TH>
                      </tr>
                    </THead>
                    <TBody>
                      {sorcerers.map((sorcerer, idx) => (
                        <tr key={`${nivel}-${sorcerer.hechiceroId}`} className="border-b border-slate-700 hover:bg-slate-800/50">
                          <TD className="font-medium">
                            {idx + 1}. {sorcerer.hechiceroId}
                          </TD>
                          <TD className="text-amber-400">{sorcerer.nombreHechicero}</TD>
                          <TD className="text-center">{sorcerer.totalMisiones}</TD>
                          <TD className="text-center">
                            <span className="text-green-400 font-semibold">
                              {sorcerer.misionesExitosas}
                            </span>
                          </TD>
                          <TD className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-12 bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                                  style={{ width: `${sorcerer.porcentajeExito}%` }}
                                />
                              </div>
                              <span className="font-bold text-sm w-12 text-right text-slate-200">
                                {sorcerer.porcentajeExito.toFixed(1)}%
                              </span>
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </TBody>
                  </Table>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <EmptyState title={t('common.error')} description={t('common.errorDescription')} />
          )}
        </div>
      )}
    </div>
  );
};
