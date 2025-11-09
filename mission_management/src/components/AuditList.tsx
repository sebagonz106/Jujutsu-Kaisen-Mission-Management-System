import React, { useMemo } from 'react';
import type { AuditEntry } from '../types/audit';
import { useAudit } from '../hooks/useAudit';
import { Skeleton } from '../components/ui/Skeleton';

export const AuditList: React.FC<{ limit?: number }> = ({ limit = 20 }) => {
  const { list } = useAudit({ limit, refetchIntervalMs: 10_000 });

  const formatLine = useMemo(() => {
    const base: Record<AuditEntry['action'], string> = {
      create: 'Se creó',
      update: 'Se actualizó',
      delete: 'Se eliminó',
    } as const;

    const extractAfter = (text: string, marker: RegExp) => {
      const m = text.match(marker);
      return m && m[1] ? m[1] : undefined;
    };

    return (e: AuditEntry): string => {
      const head = base[e.action] ?? '';
      const summary = e.summary ?? '';
      if (e.entity === 'sorcerer') {
        const name = extractAfter(summary, /hechicero\s+(.+)$/i);
        return name ? `${head} al hechicero ${name}` : `${head} un hechicero`;
      }
      if (e.entity === 'curse') {
        const name = extractAfter(summary, /maldaci[oó]n\s+(.+)$/i) || extractAfter(summary, /maldicion\s+(.+)$/i);
        return name ? `${head} la maldición ${name}` : `${head} una maldición`;
      }
      // mission
      const m = summary.match(/(atiende|que atendía)\s+(.+)$/i);
      if (m && m[1]) {
        const name = m[2];
        return `${head} una misión que atiende ${name}`;
      }
      return `${head} una misión`;
    };
  }, []);

  return (
    <div>
      {list.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : list.isError ? (
        <div className="text-red-400">Error cargando acciones recientes</div>
      ) : (
        <ul className="divide-y divide-slate-800/60">
          {(list.data ?? []).map((e) => (
            <li key={e.id} className="py-2 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm text-slate-100">{formatLine(e)}</div>
                <div className="text-xs text-slate-500">por {e.actorName ?? e.actorRole}{e.actorRank ? ` (${e.actorRank})` : ''}</div>
              </div>
              <div className="text-xs text-slate-400 tabular-nums">{new Date(e.timestamp).toLocaleString()}</div>
            </li>
          ))}
          {(list.data ?? []).length === 0 && <li className="py-2 text-slate-400">Sin actividad reciente</li>}
        </ul>
      )}
    </div>
  );
};
