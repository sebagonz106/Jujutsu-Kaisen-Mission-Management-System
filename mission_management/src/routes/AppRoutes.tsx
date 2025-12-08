import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage.tsx';
import { RegisterPage } from '../pages/RegisterPage.tsx';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import { RoleGuard } from './RoleGuard.tsx';
import AdminUsersPage from '../pages/admin/AdminUsersPage.tsx';
import { HomePage } from '../pages/home/HomePage.tsx';
import { RecentActionsPage } from '../pages/audit/RecentActionsPage.tsx';
import { QueryHistoryPage } from '../pages/queries/QueryHistoryPage.tsx';
import { QueriesIndexPage } from '../pages/queries/QueriesIndexPage.tsx';
import { CursesByStatePage } from '../pages/queries/CursesByStatePage.tsx';
import { useAuth } from '../hooks/useAuth';
import { t } from '../i18n';

// Placeholder dashboard components (texto en español)
const SorcererDashboard = () => <div className="p-4">Panel Hechicero</div>;
const SupportDashboard = () => <div className="p-4">Panel Soporte</div>;
const AdminDashboard = () => <div className="p-4">Panel Administrador</div>;
const Forbidden = () => <div className="p-4">403 - Acceso denegado</div>;
const EntityIndex = () => {
  const { user } = useAuth();
  return (
  <div className="space-y-4 fade-in">
    <h2 className="page-title">Entidades</h2>
    <div className="card-surface p-4 overflow-x-auto">
      <nav className="flex gap-2 flex-wrap">
        <Link className="nav-link" to="/sorcerers">{t('nav.sorcerers')}</Link>
        <Link className="nav-link" to="/curses">{t('nav.curses')}</Link>
        <Link className="nav-link" to="/missions">{t('nav.missions')}</Link>
        <Link className="nav-link" to="/locations">{t('nav.locations')}</Link>
        <Link className="nav-link" to="/techniques">{t('nav.techniques')}</Link>
        <Link className="nav-link" to="/resources">{t('nav.resources')}</Link>
        <Link className="nav-link" to="/requests">{t('nav.requests')}</Link>
        <Link className="nav-link" to="/support-staff">{t('nav.supportStaff')}</Link>
        <Link className="nav-link" to="/transfers">{t('nav.transfers')}</Link>
        <Link className="nav-link" to="/resource-usages">{t('nav.resourceUsages')}</Link>
        <Link className="nav-link" to="/sorcerers-in-charge">{t('nav.sorcerersInCharge')}</Link>
        <Link className="nav-link" to="/mastered-techniques">{t('nav.masteredTechniques')}</Link>
        {user?.role === 'admin' && (
          <Link className="nav-link" to="/admin/users">Administrar usuarios</Link>
        )}
      </nav>
    </div>
  </div>
  );
};
import { SorcerersPage } from '../pages/sorcerers/SorcerersPage.tsx';
import { CursesPage } from '../pages/curses/CursesPage.tsx';
import { MissionsPage } from '../pages/missions/MissionsPage.tsx';
import { LocationsPage } from '../pages/locations/LocationsPage.tsx';
import { TechniquesPage } from '../pages/techniques/TechniquesPage.tsx';
import { ResourcesPage } from '../pages/resources/ResourcesPage.tsx';
import { RequestsPage } from '../pages/requests/RequestsPage.tsx';
import { SupportStaffPage } from '../pages/support-staff/SupportStaffPage.tsx';
import { TransfersPage } from '../pages/transfers/TransfersPage.tsx';
import { ResourceUsagesPage } from '../pages/resource-usages/ResourceUsagesPage.tsx';
import { SorcerersInChargePage } from '../pages/sorcerers-in-charge/SorcerersInChargePage.tsx';
import { MasteredTechniquesPage } from '../pages/mastered-techniques/MasteredTechniquesPage.tsx';
import Layout from '../components/Layout.tsx';

const QueriesIndexPlaceholder = () => (
  <div className="page-container">
    <h1 className="page-title">{t('pages.queries.title')}</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Link to="/queries/curses-by-state" className="card-surface p-6 hover:border-slate-500 transition-all">
        <h3 className="text-xl font-semibold text-slate-100 mb-2">{t('pages.queries.rf12.title')}</h3>
        <p className="text-slate-400 text-sm">{t('pages.queries.rf12.desc')}</p>
      </Link>
      <div className="card-surface p-6 opacity-50 cursor-not-allowed">
        <h3 className="text-xl font-semibold text-slate-400 mb-2">{t('pages.queries.emptyTitle')}</h3>
        <p className="text-slate-500 text-sm">{t('pages.queries.emptyDesc')}</p>
      </div>
    </div>
  </div>
);

const CursesByStatePlaceholder = () => (
  <div className="page-container">
    <h1 className="page-title">{t('pages.queries.rf12.title')}</h1>
    <p className="text-slate-400">Implementación en progreso...</p>
  </div>
);

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
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
        path="/dashboard/admin"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['admin']}>
              <AdminDashboard />
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
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <Layout>
              <ResourcesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <Layout>
              <RequestsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/support-staff"
        element={
          <ProtectedRoute>
            <Layout>
              <SupportStaffPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transfers"
        element={
          <ProtectedRoute>
            <Layout>
              <TransfersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resource-usages"
        element={
          <ProtectedRoute>
            <Layout>
              <ResourceUsagesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sorcerers-in-charge"
        element={
          <ProtectedRoute>
            <Layout>
              <SorcerersInChargePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mastered-techniques"
        element={
          <ProtectedRoute>
            <Layout>
              <MasteredTechniquesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/entities/recent-actions"
        element={
          <ProtectedRoute>
            <Layout>
              <RecentActionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/queries"
        element={
          <ProtectedRoute>
            <Layout>
              <QueriesIndexPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/queries/history"
        element={
          <ProtectedRoute>
            <Layout>
              <QueryHistoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/queries/curses-by-state"
        element={
          <ProtectedRoute>
            <Layout>
              <CursesByStatePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['admin']}>
              <Layout>
                <AdminUsersPage />
              </Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<div className="p-4">404 - No encontrado</div>} />
    </Routes>
  </BrowserRouter>
);
