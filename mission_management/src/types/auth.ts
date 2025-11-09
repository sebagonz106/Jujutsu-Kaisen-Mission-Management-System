/**
 * @fileoverview Type definitions for authentication.
 *
 * Defines request and response types for authentication endpoints.
 *
 * @module types/auth
 */

/**
 * Login request payload.
 */
export interface LoginRequest {
  /** User's email address. */
  email: string;

  /** User's password. */
  password: string;
}

/**
 * Registration request payload.
 *
 * Note: Role is not user-selectable; the backend automatically assigns 'observer' role.
 */
export interface RegisterRequest {
  /** User's display name. */
  name: string;

  /** User's email address. */
  email: string;

  /** User's password. */
  password: string;
}

/**
 * Authenticated user object.
 */
export interface AuthUser {
  /** Unique user identifier. */
  id: number;

  /** User role: determines access permissions. */
  role: 'sorcerer' | 'support' | 'observer';

  /** User's display name. */
  name: string;

  /** Sorcerer rank (e.g., 'alto', 'especial'). Only applicable for sorcerers. */
  rank?: string;
}

/**
 * Login response.
 */
export interface LoginResponse {
  /** JWT or mock token for authenticated requests. */
  accessToken: string;

  /** User data. */
  user: AuthUser;
}

/**
 * Registration response.
 *
 * Note: Newly registered users are assigned the 'observer' role.
 */
export interface RegisterResponse {
  /** JWT or mock token for authenticated requests. */
  accessToken: string;

  /** User data with 'observer' role. */
  user: AuthUser;
}

/**
 * Current user response (for /auth/me endpoint).
 */
export interface MeResponse {
  /** Current authenticated user. */
  user: AuthUser;
}
