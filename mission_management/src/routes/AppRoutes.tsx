import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';

// Placeholder dashboard components
const SorcererDashboard = () => <div className="p-4">Dashboard Sorcerer</div>;
const SupportDashboard = () => <div className="p-4">Dashboard Support</div>;
const ObserverDashboard = () => <div className="p-4">Dashboard Observer</div>;
const Forbidden = () => <div className="p-4">403 - Acceso denegado</div>;

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
      <Route path="*" element={<div className="p-4">404</div>} />
    </Routes>
  </BrowserRouter>
);
