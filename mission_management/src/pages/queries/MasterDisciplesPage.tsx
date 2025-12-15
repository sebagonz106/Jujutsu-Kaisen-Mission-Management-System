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

  // Fetch master-disciple data
  const { data, hasNextPage, isFetchingNextPage, isLoading, isError, fetchNextPage } = useMasterDisciples({
    pageSize: 20,
  });

  // Flatten and sort data client-side
  const masters = useMemo(() => {
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
      const response = await apiClient.get('/queries/master-disciples/pdf', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'maestros-discipulos.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
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
            {isExporting ? 'Exportando...' : '📄 PDF'}
          </Button>
        </div>

        {/* Table */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </div>
        )}

        {isEmpty && <EmptyState title={t('common.noResults')} />}

        {!isLoading && masters.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="w-8 px-4 py-3"></th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('hechiceroId')}
                    >
                      <div className="flex items-center gap-2">
                        <span>{t('pages.queries.masterDisciples.masterId')}</span>
                        {sortKey === 'hechiceroId' && (
                          <span className="text-slate-600">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('nombreHechicero')}
                    >
                      <div className="flex items-center gap-2">
                        <span>{t('pages.queries.masterDisciples.name')}</span>
                        {sortKey === 'nombreHechicero' && (
                          <span className="text-slate-600">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('grado')}
                    >
                      <div className="flex items-center gap-2">
                        <span>{t('pages.queries.masterDisciples.grade')}</span>
                        {sortKey === 'grado' && (
                          <span className="text-slate-600">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                      {t('pages.queries.masterDisciples.disciples')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {masters.map((master) => (
                    <tbody key={master.hechiceroId}>
                      {/* Master Row */}
                      <tr className="border-b hover:bg-slate-50">
                        <td className="w-8 px-4 py-3 text-center">
                          <button
                            onClick={() => toggleExpanded(master.hechiceroId)}
                            className="hover:bg-slate-200 rounded p-1 transition-colors"
                            title={
                              expandedMasters.has(master.hechiceroId) ? 'Contraer' : 'Expandir'
                            }
                          >
                            <span className="text-lg text-slate-600">
                              {expandedMasters.has(master.hechiceroId) ? '▼' : '▶'}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {master.hechiceroId}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {master.nombreHechicero || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {master.grado || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {master.discipulos.length} {t('pages.queries.masterDisciples.disciples')}
                        </td>
                      </tr>

                      {/* Disciples Rows */}
                      {expandedMasters.has(master.hechiceroId) &&
                        master.discipulos.map((discipulo: any, idx: number) => (
                          <tr
                            key={`${master.hechiceroId}-discipulo-${idx}`}
                            className="border-b bg-slate-50 hover:bg-slate-100"
                          >
                            <td className="w-8 px-4 py-2"></td>
                            <td colSpan={4} className="px-4 py-2">
                              <div className="flex items-start space-x-3">
                                <div className="text-slate-400 mt-0.5">
                                  {idx === master.discipulos.length - 1 ? '└─' : '├─'}
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-slate-900">
                                    {discipulo.nombreDiscipulo || 'N/A'}
                                  </div>
                                  <div className="flex gap-4 text-xs text-slate-600">
                                    <span>
                                      <strong>{t('pages.queries.masterDisciples.grade')}:</strong>{' '}
                                      {discipulo.gradoDiscipulo || 'N/A'}
                                    </span>
                                    <span>
                                      <strong>{t('pages.queries.masterDisciples.relation')}:</strong>{' '}
                                      {discipulo.tipoRelacion || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center p-4 border-t">
                <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} size="sm">
                  {isFetchingNextPage ? t('common.loading') : 'Cargar más'}
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
