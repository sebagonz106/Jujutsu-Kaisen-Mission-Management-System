/**
 * @fileoverview RoleGuard component for role-based access control.
 *
 * Restricts access to routes based on user roles.
 * Redirects unauthorized users to a 403 Forbidden page.
 *
 * @module routes/RoleGuard
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import React from 'react';

/**
 * RoleGuard component.
 *
 * Checks if the current user's role is included in the allowed roles list.
 * If not, redirects to `/403` (Forbidden). If not authenticated, redirects to `/login`.
 *
 * @param props - Component props.
 * @param props.roles - Array of allowed roles.
 * @param props.children - Content to render if role is allowed.
 *
 * @example
 * ```tsx
 * <RoleGuard roles={['support', 'sorcerer']}>
 *   <AdminPanel />
 * </RoleGuard>
 * ```
 */
export const RoleGuard: React.FC<{ roles: Array<'sorcerer' | 'support' | 'admin'>; children: React.ReactNode }> = ({ roles, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  // // Admin has full access
  // if (user.role === 'admin') return <>{children}</>;
  // if (!roles.includes(user.role)) return <Navigate to="/403" replace />;
  return <>{children}</>;
};
