/**
 * @fileoverview Recent actions page with full audit list.
 *
 * Displays a complete history of system actions with infinite scrolling pagination.
 * Only accessible to users with mutation permissions (admin, support, high-rank sorcerers).
 *
 * @module pages/audit/RecentActionsPage
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteAudit } from '../../hooks/useInfiniteAudit';
import { useAuth } from '../../hooks/useAuth';
import { canMutate as canMutateByRole } from '../../utils/permissions';
import { formatAuditLine } from '../../utils/auditFormat';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Table, THead, TBody, TH, TD } from '../../components/ui/Table';
import { t } from '../../i18n';

/**
 * RecentActionsPage component.
 *
 * Features:
 * - Full audit log with infinite scrolling
 * - Table layout with Action, Actor, and Timestamp columns
 * - Permission guard redirects unauthorized users
 * - Export PDF button (disabled, coming soon)
 */
export const RecentActionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canMutate = canMutateByRole(user);
  
  const { query } = useInfiniteAudit({ pageSize: 50, refetchIntervalMs: 10_000 });
  const entries = useMemo(() => (query.data?.pages ?? []).flatMap((p) => p.items), [query.data]);

  // Redirect if user doesn't have permissions
  if (!canMutate) {
    navigate('/', { replace: true });
    return null;
  }

  const loadMore = async () => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    await query.fetchNextPage();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{t('pages.recentActions.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('pages.recentActions.desc')}</p>
        </div>
        <Button
          variant="secondary"
          disabled
          title={t('pages.recentActions.comingSoon')}
        >
          {t('pages.recentActions.exportPdf')}
        </Button>
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : query.isError ? (
        <div className="text-red-400">{t('ui.errorLoadingRecentActions')}</div>
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <TH>Acción</TH>
                <TH>Actor</TH>
                <TH>Fecha y Hora</TH>
              </tr>
            </THead>
            <TBody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <TD>{formatAuditLine(e)}</TD>
                  <TD>
                    <div className="flex flex-col">
                      <span>{e.actorName ?? e.actorRole}</span>
                      {e.actorRank && <span className="text-xs text-slate-500">({e.actorRank})</span>}
                    </div>
                  </TD>
                  <TD className="tabular-nums">{new Date(e.timestamp).toLocaleString()}</TD>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <TD colSpan={3} className="text-center text-slate-400">
                    {t('ui.noRecentActivity')}
                  </TD>
                </tr>
              )}
            </TBody>
          </Table>

          {entries.length > 0 && query.hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={loadMore}
                disabled={!query.hasNextPage || query.isFetchingNextPage}
              >
                {query.isFetchingNextPage ? t('ui.loadingMore') : t('ui.loadMore')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
