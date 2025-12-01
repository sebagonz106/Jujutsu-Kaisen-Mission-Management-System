/**
 * @fileoverview AuthContext definition and types.
 *
 * Defines the authentication context, including the shape of the authenticated
 * user and the context value exposed by `AuthProvider`.
 *
 * @module context/AuthContextInstance
 */

import { createContext } from 'react';

/**
 * Represents an authenticated user.
 */
export interface AuthUser {
  /** Unique user identifier. */
  id: number;

  /** User role: determines access permissions. */
  role: 'sorcerer' | 'support' | 'admin';

  /** Sorcerer rank (e.g., 'alto', 'especial'). Only applicable for sorcerers. */
  rank?: string;

  /** User's display name. */
  name?: string;

  /** User email address. */
  email?: string; // added to match backend AuthUser payload
}

/**
 * Context value provided by `AuthProvider`.
 */
export interface AuthContextValue {
  /** Currently logged-in user, or null if not authenticated. */
  user: AuthUser | null;

  /**
   * Logs in a user with a token and user object.
   *
   * @param token - Access token for authenticated requests.
   * @param user - User data returned from the login endpoint.
   */
  login: (token: string, user: AuthUser) => void;

  /** Logs out the current user, clearing token and user state. */
  logout: () => void;
}

/**
 * AuthContext instance.
 *
 * Used internally by `AuthProvider` and `useAuth` hook.
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
