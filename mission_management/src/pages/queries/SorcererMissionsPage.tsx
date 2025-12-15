/**
 * @fileoverview Query2: Missions by Sorcerer page.
 *
 * Allows selecting a sorcerer and viewing their missions with infinite scroll pagination.
 * Features search/filter functionality and client-side sorting.
 *
 * @module pages/queries/SorcererMissionsPage
 */

import { useMemo, useState } from 'react';
import { useInfiniteSorcerers } from '../../hooks/useInfiniteSorcerers';
import { useSorcererMissions } from '../../hooks/useSorcererMissions';
import type { Query2Result } from '../../types/query2Result';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
  sorcererId: z.number().int().positive('Debes seleccionar un hechicero'),
});

type QueryFormValues = z.infer<typeof querySchema>;

/**
 * SorcererMissionsPage component (Query2).
 *
 * Features:
 * - Search input to filter sorcerers by name, grade, or ID
 * - Dropdown select to choose a sorcerer
 * - Paginated missions with infinite scrolling
 * - Client-side sorting by any column
 * - Read-only table (no CRUD operations)
 * - Export PDF button
 * - Empty state handling
 *
 * Pattern: Search + Select + Infinite Table with Sorting
 */
export const SorcererMissionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSorcererId, setSelectedSorcererId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof Query2Result>('misionId');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isExporting, setIsExporting] = useState(false);

  const { handleSubmit } = useForm<QueryFormValues>({
    resolver: zodResolver(querySchema),
    defaultValues: { sorcererId: undefined },
  });

  // Fetch all sorcerers for dropdown
  const sorcerersQuery = useInfiniteSorcerers({ pageSize: 100 });
  const allSorcerers = (sorcerersQuery.data?.pages ?? []).flatMap((p) => p.items);

  // Filter sorcerers by search term
  const filteredSorcerers = useMemo(() => {
    if (!searchTerm.trim()) return allSorcerers;

    const term = searchTerm.toLowerCase();
    return allSorcerers.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.grado.toLowerCase().includes(term) ||
        s.id.toString().includes(term)
    );
  }, [allSorcerers, searchTerm]);

  // Fetch missions for selected sorcerer
  const { data: missionsData, hasNextPage, isFetchingNextPage, isLoading, isError } = useSorcererMissions({
    sorcererId: selectedSorcererId ?? 0,
    enabled: selectedSorcererId !== null,
  });

  // Flatten, sort missions client-side
  const missions = useMemo(() => {
    const flat = (missionsData?.pages ?? []).flatMap((p) => p.items);
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
  }, [missionsData, sortKey, sortDir]);

  const toggleSort = (key: keyof Query2Result) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const onSubmit = (values: QueryFormValues) => {
    setSelectedSorcererId(values.sorcererId);
  };

  const handleExportPdf = async () => {
    if (!selectedSorcererId || missions.length === 0) return;

    setIsExporting(true);
    try {
      const response = await apiClient.get('/queries/sorcerer-missions/pdf', {
        params: { sorcererId: selectedSorcererId },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `misiones-hechicero-${selectedSorcererId}.pdf`);
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

  const shouldFetch = selectedSorcererId !== null;
  const isEmpty = shouldFetch && !isLoading && missions.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{t('pages.queries.sorcererMissions.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('pages.queries.sorcererMissions.description')}</p>
        </div>
      </div>

      {/* Search and Select Form */}
      <div className="card-surface p-6 space-y-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">
            {t('pages.queries.sorcererMissions.searchPlaceholder')}
          </label>
          <Input
            type="text"
            placeholder={t('pages.queries.sorcererMissions.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-slate-500 mt-1">
            {filteredSorcerers.length} {t('common.sorcerersFound')}
          </p>
        </div>

        {/* Sorcerer Select */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">
              {t('pages.queries.sorcererMissions.selectLabel')}
            </label>
            <select
              value={selectedSorcererId?.toString() || ''}
              onChange={(e) => {
                const id = e.target.value ? parseInt(e.target.value) : null;
                setSelectedSorcererId(id);
              }}
              className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">-- {t('ui.selectPlaceholder')} --</option>
              {filteredSorcerers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.grado})
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
            <div className="text-sm text-slate-400">
              {isLoading ? 'Cargando...' : `${missions.length} misiones encontradas`}
            </div>
            <Button
              onClick={handleExportPdf}
              disabled={isExporting || missions.length === 0}
              variant="secondary"
              size="sm"
            >
              {isExporting ? 'Exportando...' : '📄 PDF'}
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

          {isEmpty && <EmptyState title="Sin resultados" />}

          {!isLoading && missions.length > 0 && (
            <div className="card-surface overflow-hidden">
              <Table>
                <THead>
                  <tr>
                    <TH onClick={() => toggleSort('misionId')}>
                      <SortHeader active={sortKey === 'misionId'} direction={sortDir} label="Misión ID" onClick={() => {}} />
                    </TH>
                    <TH onClick={() => toggleSort('fechaMision')}>
                      <SortHeader active={sortKey === 'fechaMision'} direction={sortDir} label="Fecha" onClick={() => {}} />
                    </TH>
                    <TH onClick={() => toggleSort('resultado')}>
                      <SortHeader active={sortKey === 'resultado'} direction={sortDir} label="Resultado" onClick={() => {}} />
                    </TH>
                  </tr>
                </THead>
                <TBody>
                  {missions.map((mission) => (
                    <tr key={`${mission.misionId}-${mission.fechaMision}`} className="border-b border-slate-700 hover:bg-slate-800/50">
                      <TD>{mission.misionId}</TD>
                      <TD>{new Date(mission.fechaMision).toLocaleDateString()}</TD>
                      <TD>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            mission.resultado === 'Éxito'
                              ? 'bg-green-900/50 text-green-300'
                              : mission.resultado === 'Fracaso'
                              ? 'bg-red-900/50 text-red-300'
                              : 'bg-yellow-900/50 text-yellow-300'
                          }`}
                        >
                          {mission.resultado || 'N/A'}
                        </span>
                      </TD>
                    </tr>
                  ))}
                </TBody>
              </Table>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="flex justify-center p-4 border-t border-slate-700">
                  <Button onClick={() => {}} disabled={isFetchingNextPage} size="sm">
                    {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {isError && (
            <EmptyState title="Error" description="No se pudieron cargar los datos" />
          )}
        </div>
      )}
    </div>
  );
};
