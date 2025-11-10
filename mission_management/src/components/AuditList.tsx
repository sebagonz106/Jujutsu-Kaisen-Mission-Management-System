import React, { useMemo } from 'react';
// Removed unused queryClient and AuditEntry import after converting to useInfiniteQuery
import { useInfiniteAudit } from '../hooks/useInfiniteAudit';
import { Skeleton } from '../components/ui/Skeleton';
import { formatAuditLine } from '../utils/auditFormat';
import { t } from '../i18n';

export const AuditList: React.FC<{ limit?: number }> = ({ limit = 20 }) => {
  // keep API the same prop name but use it as pageSize in infinite query
  const { query } = useInfiniteAudit({ pageSize: limit, refetchIntervalMs: 10_000 });
  const entries = useMemo(() => (query.data?.pages ?? []).flatMap((p) => p.items), [query.data]);

  const loadMore = async () => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    await query.fetchNextPage();
  };

  return (
    <div role="status" aria-live="polite" aria-busy={query.isLoading}>
      {query.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : query.isError ? (
  <div className="text-red-400">{t('ui.errorLoadingRecentActions')}</div>
      ) : (
        <>
          <ul className="divide-y divide-slate-800/60">
            {entries.map((e) => (
              <li key={e.id} className="py-2 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm text-slate-100">{formatAuditLine(e)}</div>
                  <div className="text-xs text-slate-500">por {e.actorName ?? e.actorRole}{e.actorRank ? ` (${e.actorRank})` : ''}</div>
                </div>
                <div className="text-xs text-slate-400 tabular-nums">{new Date(e.timestamp).toLocaleString()}</div>
              </li>
            ))}
            {entries.length === 0 && <li className="py-2 text-slate-400">{t('ui.noRecentActivity')}</li>}
          </ul>
          {entries.length > 0 && query.hasNextPage && (
            <div className="pt-3">
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
                onClick={loadMore}
                disabled={!query.hasNextPage || query.isFetchingNextPage}
                aria-label="Ver más"
              >
                {query.isFetchingNextPage ? t('ui.loadingMore') : t('ui.loadMore')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
