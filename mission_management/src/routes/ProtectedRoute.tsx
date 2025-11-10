/**
 * @fileoverview ProtectedRoute component for authentication checks.
 *
 * Redirects unauthenticated users to the login page.
 * Authenticated users are allowed to access the wrapped content.
 *
 * @module routes/ProtectedRoute
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import React from 'react';

/**
 * ProtectedRoute component.
 *
 * Renders children if user is authenticated, otherwise redirects to `/login`.
 * Preserves the intended destination in location state for post-login redirect.
 *
 * @param props - Component props.
 * @param props.children - Content to render if authenticated.
 *
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
};
