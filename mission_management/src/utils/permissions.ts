/**
 * @fileoverview Permission helpers for role-based access control.
 *
 * Centralizes authorization logic so UI components and server-side checks remain consistent.
 *
 * **Current Policy:**
 * - **Admin** users: Full access to all operations and user management.
 * - **Support** users: Full CRUD access to all entities.
 * - **Sorcerers** with rank `alto` or `especial`: Full CRUD access.
 * - Low-rank sorcerers: Read-only access.
 *
 * @module utils/permissions
 */

import type { AuthUser } from '../context/AuthContextInstance';

export type Role = AuthUser['role'];

/**
 * Determines if a user can perform create/update/delete operations on entities.
 *
 * @param user - The authenticated user object (or null if not authenticated).
 * @returns `true` if the user is allowed to mutate; `false` otherwise.
 *
 * @example
 * ```ts
 * const user = { role: 'admin', id: 1, name: 'Admin' };
 * canMutate(user); // true
 * ```
 */
export const canMutate = (user?: AuthUser | null) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'support') return true;
  if (user.role !== 'sorcerer') return false;
  const allowedRanks = ['alto', 'especial'];
  return !!user.rank && allowedRanks.includes(user.rank as string);
};

/**
 * Determines if a user can view entity lists.
 *
 * @returns `true` for all roles (no restrictions on viewing).
 */
export const canViewEntities = () => true; // all roles for now

/**
 * Checks if a user can access a specific dashboard based on their role.
 *
 * @param role - The user's role.
 * @param allowed - Array of roles allowed to access the dashboard (default: all roles).
 * @returns `true` if the user's role is in the allowed list.
 */
export const canAccessDashboard = (role?: Role | null, allowed: Role[] = ['sorcerer', 'support', 'admin']) =>
  !!role && allowed.includes(role);
