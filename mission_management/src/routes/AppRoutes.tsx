import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useAudit } from '../hooks/useAudit.ts';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import type { AuditEntry } from '../types/audit';
import { LoginPage } from '../pages/LoginPage.tsx';
import { RegisterPage } from '../pages/RegisterPage.tsx';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import { RoleGuard } from './RoleGuard.tsx';

// Placeholder dashboard components (texto en español)
const SorcererDashboard = () => <div className="p-4">Panel Hechicero</div>;
const SupportDashboard = () => <div className="p-4">Panel Soporte</div>;
const ObserverDashboard = () => <div className="p-4">Panel Observador</div>;
const Forbidden = () => <div className="p-4">403 - Acceso denegado</div>;
const EntityIndex = () => {
  const { list } = useAudit({ limit: 20, refetchIntervalMs: 10_000 });

  // (previous toSpanish mapping removed; now using full sentence formatter below)

  const formatLine = useMemo(() => {
    const base: Record<AuditEntry['action'], string> = {
      create: 'Se añadió',
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
        const name = extractAfter(summary, /maldición\s+(.+)$/i);
        return name ? `${head} la maldición ${name}` : `${head} una maldición`;
      }
      // mission
      const attends = extractAfter(summary, /(que atiende|que atendía)\s+(.+)$/i);
      if (attends) {
        // attends contains both verb+name because of capture grouping above; re-extract verb and name cleanly
        const m = summary.match(/(que atiende|que atendía)\s+(.+)$/i);
        const verb = m?.[1];
        const name = m?.[2];
        return `${head} una misión ${verb?.toLowerCase()} ${name}`;
      }
      return `${head} una misión`;
    };
  }, []);

  return (
    <div className="space-y-4 fade-in">
      <h2 className="page-title">Panel</h2>
      <div className="card-surface p-4">
        <nav className="flex gap-2">
          <Link className="nav-link" to="/sorcerers">Hechiceros</Link>
          <Link className="nav-link" to="/curses">Maldiciones</Link>
          <Link className="nav-link" to="/missions">Misiones</Link>
        </nav>
      </div>

      <div className="space-y-2">
  <h2 className="page-title">Acciones recientes</h2>
        <div className="card-surface p-4">
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
                    <div className="text-sm">
                      <span className="text-slate-100">{formatLine(e)}</span>
                    </div>
                    <div className="text-xs text-slate-500">por {e.actorRole}{e.actorRank ? ` (${e.actorRank})` : ''}</div>
                  </div>
                  <div className="text-xs text-slate-400 tabular-nums">{new Date(e.timestamp).toLocaleString()}</div>
                </li>
              ))}
              {(list.data ?? []).length === 0 && (
                <li className="py-2 text-slate-400">Sin actividad reciente</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
import { SorcerersPage } from '../pages/sorcerers/SorcerersPage.tsx';
import { CursesPage } from '../pages/curses/CursesPage.tsx';
import { MissionsPage } from '../pages/missions/MissionsPage.tsx';
import Layout from '../components/Layout.tsx';

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard/sorcerer"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['sorcerer']}>
              <SorcererDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/support"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['support']}>
              <SupportDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/observer"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['observer']}>
              <ObserverDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route path="/403" element={<Forbidden />} />
      <Route
        path="/entities"
        element={
          <ProtectedRoute>
            <Layout>
              <EntityIndex />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sorcerers"
        element={
          <ProtectedRoute>
            <Layout>
              <SorcerersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/curses"
        element={
          <ProtectedRoute>
            <Layout>
              <CursesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/missions"
        element={
          <ProtectedRoute>
            <Layout>
              <MissionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
  <Route path="*" element={<div className="p-4">404 - No encontrado</div>} />
    </Routes>
  </BrowserRouter>
);
