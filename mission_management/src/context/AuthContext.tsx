/**
 * @fileoverview AuthProvider component for managing authentication state.
 *
 * This context provider manages the currently logged-in user and provides
 * `login` and `logout` functions to child components via the `useAuth` hook.
 *
 * @module context/AuthContext
 */

import { useState, useCallback } from 'react';
import { setAccessToken } from '../api/client';
import { AuthContext } from './AuthContextInstance.ts';
import type { AuthUser } from './AuthContextInstance.ts';

/**
 * AuthProvider component.
 *
 * Wraps the application (or a subtree) and provides authentication state
 * and methods to all descendant components.
 *
 * @param props - Component props.
 * @param props.children - Child components to render within the provider.
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  /**
   * Logs in a user by setting the access token and user state.
   *
   * @param token - The JWT or mock token to use for authenticated requests.
   * @param u - The user object returned from the login endpoint.
   */
  const login = useCallback((token: string, u: AuthUser) => {
    setAccessToken(token);
    setUser(u);
  }, []);

  /**
   * Logs out the current user by clearing the access token and user state.
   */
  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

// useAuth hook moved to hooks/useAuth.ts to satisfy fast-refresh constraints
