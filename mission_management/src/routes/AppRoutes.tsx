import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage.tsx';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import { RoleGuard } from './RoleGuard.tsx';

// Placeholder dashboard components
const SorcererDashboard = () => <div className="p-4">Dashboard Sorcerer</div>;
const SupportDashboard = () => <div className="p-4">Dashboard Support</div>;
const ObserverDashboard = () => <div className="p-4">Dashboard Observer</div>;
const Forbidden = () => <div className="p-4">403 - Acceso denegado</div>;
const EntityIndex = () => (
  <div className="p-4 space-y-2">
    <h2 className="text-xl font-semibold mb-2">Entities</h2>
    <nav className="flex gap-3">
      <Link className="text-indigo-400 underline" to="/sorcerers">Sorcerers</Link>
      <Link className="text-indigo-400 underline" to="/curses">Curses</Link>
      <Link className="text-indigo-400 underline" to="/missions">Missions</Link>
    </nav>
  </div>
);
import { SorcerersPage } from '../pages/sorcerers/SorcerersPage.tsx';
import { CursesPage } from '../pages/curses/CursesPage.tsx';
import { MissionsPage } from '../pages/missions/MissionsPage.tsx';

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
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
            <EntityIndex />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sorcerers"
        element={
          <ProtectedRoute>
            <SorcerersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/curses"
        element={
          <ProtectedRoute>
            <CursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/missions"
        element={
          <ProtectedRoute>
            <MissionsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<div className="p-4">404</div>} />
    </Routes>
  </BrowserRouter>
);
