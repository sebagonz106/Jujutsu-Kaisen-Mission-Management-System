/**
 * @fileoverview Query6: Master-Disciple Relationships page.
 *
 * Displays master sorcerers with their disciples in expandable rows.
 * Features infinite scroll pagination and client-side sorting.
 *
 * @module pages/queries/MasterDisciplesPage
 */

import { useMemo, useState } from 'react';
import { useMasterDisciples } from '../../hooks/useMasterDisciples';
import { type Query6Result } from '../../types/query6Result';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { t } from '../../i18n';
import { apiClient } from '../../api/client';

/**
 * MasterDisciplesPage component (Query6).
 *
 * Features:
 * - Paginated master sorcerers with infinite scrolling
 * - Expandable rows showing disciples
 * - Client-side sorting by any column (master level)
 * - Visual hierarchy with nested disciples
 * - Read-only table (no CRUD operations)
 * - Export PDF button
 * - Empty state handling
 *
 * Pattern: Infinite Table with Expandable Rows
 */
export const MasterDisciplesPage = () => {
  const [sortKey, setSortKey] = useState<keyof Query6Result>('hechiceroId');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedMasters, setExpandedMasters] = useState<Set<number>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch master-disciple data
  const { data, hasNextPage, isFetchingNextPage, isLoading, isError, fetchNextPage } = useMasterDisciples({
    pageSize: 20,
  });

  // Flatten and sort data client-side
  const masters = useMemo(() => {
    const flat = (data?.pages ?? []).flatMap((p) => p.items);
    const sorted = [...flat].sort((a, b) => {
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

    // Filter by search term
    if (!searchTerm.trim()) return sorted;
    const lower = searchTerm.toLowerCase();
    return sorted.filter((master) =>
      master.nombreHechicero?.toLowerCase().includes(lower) ||
      master.grado?.toLowerCase().includes(lower) ||
      master.discipulos.some((d) =>
        d.nombreDiscipulo?.toLowerCase().includes(lower) ||
        d.gradoDiscipulo?.toLowerCase().includes(lower)
      )
    );
  }, [data, sortKey, sortDir, searchTerm]);

  const toggleSort = (key: keyof Query6Result) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleExpanded = (hechiceroId: number) => {
    const newExpanded = new Set(expandedMasters);
    if (newExpanded.has(hechiceroId)) {
      newExpanded.delete(hechiceroId);
    } else {
      newExpanded.add(hechiceroId);
    }
    setExpandedMasters(newExpanded);
  };

  const handleExportPdf = async () => {
    if (masters.length === 0) return;

    setIsExporting(true);
    try {
      console.log('🔵 [PDF] Iniciando descarga de maestros-discípulos...');
      console.log('🔵 [PDF] Petición a: /master-disciples/pdf');
      
      const response = await apiClient.get('/master-disciples/pdf', {
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
        link.setAttribute('download', 'maestros-discipulos.pdf');
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

  const isEmpty = !isLoading && masters.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{t('pages.queries.masterDisciples.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('pages.queries.masterDisciples.desc')}</p>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="card-surface p-4">
          <input
            type="text"
            placeholder="Buscar por nombre o grado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {isLoading ? t('common.loading') : `${masters.length} ${t('pages.queries.masterDisciples.mastersFound')}`}
          </div>
          <Button
            onClick={handleExportPdf}
            disabled={isExporting || masters.length === 0}
            variant="secondary"
            size="sm"
          >
            {isExporting ? t('pages.queries.exporting') : '📄 PDF'}
          </Button>
        </div>

        {/* Table */}
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

        {!isLoading && masters.length > 0 && (
          <div className="card-surface overflow-hidden">
            <div className="space-y-4 p-4">
              {masters.map((master) => (
                <div key={master.hechiceroId} className="border border-slate-700 rounded-lg overflow-hidden">
                  {/* Master Row */}
                  <div
                    className="bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors p-4 flex items-center justify-between"
                    onClick={() => toggleExpanded(master.hechiceroId)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-lg text-slate-400">
                        {expandedMasters.has(master.hechiceroId) ? '▼' : '▶'}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-amber-400">{master.nombreHechicero || 'N/A'}</div>
                        <div className="text-xs text-slate-400 mt-1">{master.grado || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400">
                      {master.discipulos.length} {t('pages.queries.masterDisciples.disciples')}
                    </div>
                  </div>

                  {/* Disciples List */}
                  {expandedMasters.has(master.hechiceroId) && (
                    <div className="bg-slate-800/30 divide-y divide-slate-700">
                      {master.discipulos.length === 0 ? (
                        <div className="p-4 text-sm text-slate-400 text-center">
                          {t('common.noResults')}
                        </div>
                      ) : (
                        master.discipulos.map((discipulo: any, idx: number) => (
                          <div key={`${master.hechiceroId}-discipulo-${idx}`} className="p-4 hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="text-slate-500 mt-0.5 flex-shrink-0">
                                {idx === master.discipulos.length - 1 ? '└─' : '├─'}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="text-sm font-medium text-slate-200">
                                  {discipulo.nombreDiscipulo || 'N/A'}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                                  <div>
                                    <strong className="text-slate-300">{t('pages.queries.masterDisciples.grade')}:</strong>{' '}
                                    {discipulo.gradoDiscipulo || 'N/A'}
                                  </div>
                                  <div>
                                    <strong className="text-slate-300">{t('pages.queries.masterDisciples.relation')}:</strong>{' '}
                                    {discipulo.tipoRelacion || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center p-4 border-t border-slate-700">
                <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} size="sm">
                  {isFetchingNextPage ? t('common.loading') : t('ui.loadMore')}
                </Button>
              </div>
            )}
          </div>
        )}

        {isError && (
          <EmptyState title={t('common.error')} description={t('common.errorDescription')} />
        )}
      </div>
    </div>
  );
};
