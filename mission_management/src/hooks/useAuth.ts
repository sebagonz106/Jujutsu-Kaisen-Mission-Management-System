/**
 * @fileoverview Custom React hook for accessing authentication state and methods.
 * @module hooks/useAuth
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextInstance.ts';

/**
 * Hook to access the authentication context (user, login, logout).
 *
 * Must be used within an `<AuthProvider>` component tree.
 *
 * @returns The authentication context value.
 * @throws Error if used outside of `AuthProvider`.
 *
 * @example
 * ```tsx
 * const { user, login, logout } = useAuth();
 * if (user) {
 *   console.log('Logged in as:', user.name);
 * }
 * ```
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
