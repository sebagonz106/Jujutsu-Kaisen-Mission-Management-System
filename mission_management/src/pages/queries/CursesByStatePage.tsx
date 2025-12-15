/**
 * @fileoverview Query page: Curses by State (Maldiciones por Estado).
 *
 * Implements the analytical query for filtering curses by their current state.
 * Features parameter selection, sortable results table, and PDF export.
 *
 * @module pages/queries/CursesByStatePage
 */

import { useMemo, useState } from 'react';
import { useCursesByState } from '../../hooks/useCursesByState';
import type { CurseByState } from '../../types/curseByState';
import type { CurseState } from '../../types/curse';
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
import { apiClient } from '../../api/client';
import { toast } from 'sonner';

/** Zod schema for query parameters validation. */
const querySchema = z.object({
  state: z.union([
    z.literal(CURSE_STATE.activa),
    z.literal(CURSE_STATE.en_proceso_de_exorcismo),
    z.literal(CURSE_STATE.exorcisada),
  ]),
});

type QueryFormValues = z.infer<typeof querySchema>;

/** Labels for curse states in Spanish. */
const curseStateLabel = (state: CurseState): string => {
  const labels: Record<CurseState, string> = {
    activa: 'Activa',
    en_proceso_de_exorcismo: 'En Exorcismo',
    exorcisada: 'Exorcisada',
  };
  return labels[state] ?? state;
};

/**
 * CursesByStatePage component.
 *
 * Features:
 * - State selection dropdown
 * - Results table with client-side sorting
 * - PDF export functionality
 * - Empty state when no results
 */
export const CursesByStatePage = () => {
  const [selectedState, setSelectedState] = useState<CurseState | null>(null);
  const [sortKey, setSortKey] = useState<keyof CurseByState>('nombreMaldicion');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isExporting, setIsExporting] = useState(false);

  const { handleSubmit, control, formState: { errors } } = useForm<QueryFormValues>({
    resolver: zodResolver(querySchema),
  });

  // Fetch curses when state is selected
  const { query } = useCursesByState({
    state: selectedState ?? CURSE_STATE.activa,
    enabled: selectedState !== null,
  });

  const shouldFetch = selectedState !== null;
  const data = shouldFetch ? query.data : undefined;
  const isLoading = shouldFetch ? query.isLoading : false;
  const isError = shouldFetch ? query.isError : false;

  // Sort data client-side
  const curses = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const toggleSort = (key: keyof CurseByState) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const onSubmit = (values: QueryFormValues) => {
    setSelectedState(values.state);
  };

  /** Export results to PDF */
  const handleExportPdf = async () => {
    if (!selectedState) return;
    
    setIsExporting(true);
    try {
      console.log('🔵 [PDF] Iniciando descarga de maldiciones...');
      console.log('🔵 [PDF] Estado:', selectedState);
      console.log('🔵 [PDF] Petición a: /curse-queries/pdf');
      
      const response = await apiClient.get(`/curse-queries/${selectedState}/pdf`, {
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
        link.setAttribute('download', `maldiciones-${selectedState}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log('✅ [PDF] Descarga completada');
        toast.success(t('toast.pdf.exported'));
      } else {
        console.warn('⚠️ [PDF] Respuesta vacía o inválida:', response.data);
        toast.error(t('toast.pdf.emptyResponse'));
      }
    } catch (error) {
      console.error('❌ [PDF] Error exporting PDF:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      toast.error(t('toast.pdf.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{t('pages.queries.rf12.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('pages.queries.rf12.desc')}</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleExportPdf}
          disabled={!data || data.length === 0 || isExporting}
        >
          {isExporting ? t('pages.queries.exporting') : t('pages.recentActions.exportPdf')}
        </Button>
      </div>

      {/* Query Parameters Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card-surface p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {t('pages.queries.rf12.paramLabel')}
            </label>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <option value="">Seleccionar estado...</option>
                  <option value={CURSE_STATE.activa}>{curseStateLabel(CURSE_STATE.activa)}</option>
                  <option value={CURSE_STATE.en_proceso_de_exorcismo}>{curseStateLabel(CURSE_STATE.en_proceso_de_exorcismo)}</option>
                  <option value={CURSE_STATE.exorcisada}>{curseStateLabel(CURSE_STATE.exorcisada)}</option>
                </Select>
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
        <Table>
          <THead>
            <tr>
              <TH><SortHeader label="Nombre" active={sortKey==='nombreMaldicion'} direction={sortDir} onClick={() => toggleSort('nombreMaldicion')} /></TH>
              <TH><SortHeader label="Ubicación" active={sortKey==='ubicacion'} direction={sortDir} onClick={() => toggleSort('ubicacion')} /></TH>
              <TH><SortHeader label="Grado" active={sortKey==='grado'} direction={sortDir} onClick={() => toggleSort('grado')} /></TH>
              <TH><SortHeader label="Hechicero Asignado" active={sortKey==='nombreHechicero'} direction={sortDir} onClick={() => toggleSort('nombreHechicero')} /></TH>
            </tr>
          </THead>
          <TBody>
            {curses.map((c, idx) => (
              <tr key={`${c.nombreMaldicion}-${idx}`}>
                <TD>{c.nombreMaldicion}</TD>
                <TD>{c.ubicacion}</TD>
                <TD>{c.grado}</TD>
                <TD>{c.nombreHechicero || '-'}</TD>
              </tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
};
