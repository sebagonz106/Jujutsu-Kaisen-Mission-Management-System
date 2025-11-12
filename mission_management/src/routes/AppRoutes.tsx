import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuditList } from '../components/AuditList';
import { LoginPage } from '../pages/LoginPage.tsx';
import { RegisterPage } from '../pages/RegisterPage.tsx';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import { RoleGuard } from './RoleGuard.tsx';

// Placeholder dashboard components (texto en español)
const SorcererDashboard = () => <div className="p-4">Panel Hechicero</div>;
const SupportDashboard = () => <div className="p-4">Panel Soporte</div>;
const ObserverDashboard = () => <div className="p-4">Panel Observador</div>;
const Forbidden = () => <div className="p-4">403 - Acceso denegado</div>;
const EntityIndex = () => (
  <div className="space-y-4 fade-in">
    <h2 className="page-title">Panel</h2>
    <div className="card-surface p-4">
      <nav className="flex gap-2 flex-wrap">
        <Link className="nav-link" to="/sorcerers">Hechiceros</Link>
        <Link className="nav-link" to="/curses">Maldiciones</Link>
        <Link className="nav-link" to="/missions">Misiones</Link>
        <Link className="nav-link" to="/locations">Ubicaciones</Link>
        <Link className="nav-link" to="/techniques">Técnicas</Link>
      </nav>
    </div>
    <div className="space-y-2">
      <h2 className="page-title">Acciones recientes</h2>
      <div className="card-surface p-4">
        <AuditList limit={20} />
      </div>
    </div>
  </div>
);
import { SorcerersPage } from '../pages/sorcerers/SorcerersPage.tsx';
import { CursesPage } from '../pages/curses/CursesPage.tsx';
import { MissionsPage } from '../pages/missions/MissionsPage.tsx';
import { LocationsPage } from '../pages/locations/LocationsPage.tsx';
import { TechniquesPage } from '../pages/techniques/TechniquesPage.tsx';
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
      <Route
        path="/locations"
        element={
          <ProtectedRoute>
            <Layout>
              <LocationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/techniques"
        element={
          <ProtectedRoute>
            <Layout>
              <TechniquesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
  <Route path="*" element={<div className="p-4">404 - No encontrado</div>} />
    </Routes>
  </BrowserRouter>
);
