/**
 * @fileoverview Query4: Technique Effectiveness page.
 *
 * Displays sorcerers and their technique effectiveness metrics with infinite scroll pagination.
 * Features client-side sorting and effectiveness classification visualization.
 *
 * @module pages/queries/TechniqueEffectivenessPage
 */

import { useMemo, useState } from 'react';
import { useTechniqueEffectiveness } from '../../hooks/useTechniqueEffectiveness';
import type { Query4Result } from '../../types/query4Result';
import type { PagedResponse } from '../../api/pagedApi';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Table, THead, TBody, TH, TD, SortHeader } from '../../components/ui/Table';
import { Skeleton } from '../../components/ui/Skeleton';
import { t } from '../../i18n';
import { apiClient } from '../../api/client';

/**
 * Get color for effectiveness classification.
 */
const getClassificationColor = (clasificacion: string | null) => {
  if (!clasificacion) return 'bg-slate-100 text-slate-800';
  const lower = clasificacion.toLowerCase();
  if (lower.includes('alta') || lower.includes('high')) return 'bg-green-100 text-green-800';
  if (lower.includes('media') || lower.includes('medium')) return 'bg-yellow-100 text-yellow-800';
  if (lower.includes('baja') || lower.includes('low')) return 'bg-red-100 text-red-800';
  return 'bg-slate-100 text-slate-800';
};

/**
 * TechniqueEffectivenessPage component (Query4).
 *
 * Features:
 * - Paginated sorcerer technique effectiveness data with infinite scrolling
 * - Client-side sorting by any column
 * - Visual classification badges (Alta/Media/Baja)
 * - Read-only table (no CRUD operations)
 * - Export PDF button
 * - Empty state handling
 *
 * Pattern: Infinite Table with Sorting
 */
export const TechniqueEffectivenessPage = () => {
  const [sortKey, setSortKey] = useState<keyof Query4Result>('hechiceroId');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch technique effectiveness data
  const { data, hasNextPage, isFetchingNextPage, isLoading, isError } = useTechniqueEffectiveness({
    pageSize: 20,
  });

  // Flatten and sort data client-side
  const techniques = useMemo(() => {
    const flat = (data?.pages ?? []).flatMap((p: PagedResponse<Query4Result>) => p.items);
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

  const toggleSort = (key: keyof Query4Result) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleExportPdf = async () => {
    if (techniques.length === 0) return;

    setIsExporting(true);
    try {
      console.log('🔵 [PDF] Iniciando descarga de técnicas...');
      console.log('🔵 [PDF] Petición a: /queries/technique-effectiveness/pdf');
      
      const response = await apiClient.get('/queries/technique-effectiveness/pdf', {
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
        link.setAttribute('download', 'efectividad-tecnicas.pdf');
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

  const isEmpty = !isLoading && techniques.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{t('pages.queries.techniqueEffectiveness.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('pages.queries.techniqueEffectiveness.description')}</p>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {isLoading ? t('common.loading') : `${techniques.length} ${t('common.techniquesFound')}`}
          </div>
          <Button
            onClick={handleExportPdf}
            disabled={isExporting || techniques.length === 0}
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

        {!isLoading && techniques.length > 0 && (
          <div className="card-surface overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <tr>
                    <TH onClick={() => toggleSort('hechiceroId')}>
                      <SortHeader active={sortKey === 'hechiceroId'} direction={sortDir} label="ID Hechicero" onClick={() => {}} />
                    </TH>
                    <TH onClick={() => toggleSort('nombreHechicero')}>
                      <SortHeader active={sortKey === 'nombreHechicero'} direction={sortDir} label="Nombre" onClick={() => {}} />
                    </TH>
                    <TH onClick={() => toggleSort('grado')}>
                      <SortHeader active={sortKey === 'grado'} direction={sortDir} label="Grado" onClick={() => {}} />
                    </TH>
                    <TH onClick={() => toggleSort('promedioEfectividad')}>
                      <SortHeader active={sortKey === 'promedioEfectividad'} direction={sortDir} label="Efectividad Promedio" onClick={() => {}} />
                    </TH>
                    <TH onClick={() => toggleSort('clasificacion')}>
                      <SortHeader active={sortKey === 'clasificacion'} direction={sortDir} label="Clasificación" onClick={() => {}} />
                    </TH>
                    <TH onClick={() => toggleSort('cantidadTecnicas')}>
                      <SortHeader active={sortKey === 'cantidadTecnicas'} direction={sortDir} label="Técnicas" onClick={() => {}} />
                    </TH>
                  </tr>
                </THead>
                <TBody>
                  {techniques.map((technique) => (
                    <tr key={technique.hechiceroId} className="border-b border-slate-700 hover:bg-slate-800/50">
                      <TD>{technique.hechiceroId}</TD>
                      <TD className="text-amber-400">{technique.nombreHechicero || 'N/A'}</TD>
                      <TD>{technique.grado || 'N/A'}</TD>
                      <TD className="font-semibold text-purple-400">{technique.promedioEfectividad.toFixed(2)}%</TD>
                      <TD>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            (technique.clasificacion?.toLowerCase().includes('alta') || technique.clasificacion?.toLowerCase().includes('high')) 
                              ? 'bg-green-900/50 text-green-300' 
                              : (technique.clasificacion?.toLowerCase().includes('media') || technique.clasificacion?.toLowerCase().includes('medium'))
                              ? 'bg-yellow-900/50 text-yellow-300'
                              : 'bg-red-900/50 text-red-300'
                          }`}
                        >
                          {technique.clasificacion || 'N/A'}
                        </span>
                      </TD>
                      <TD className="text-center">{technique.cantidadTecnicas}</TD>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center p-4 border-t border-slate-700">
                <Button onClick={() => {}} disabled={isFetchingNextPage} size="sm">
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
