/**
 * @fileoverview Type definitions for audit logging entries.
 *
 * Captures who did what to which entity and when, with a short summary.
 */

/** Supported entity kinds that can be audited. */
export type AuditEntity = 'sorcerer' | 'curse' | 'mission';

/** Supported audit actions. */
export type AuditAction = 'create' | 'update' | 'delete';

/**
 * Single audit log entry.
 */
export interface AuditEntry {
  /** Unique identifier of the audit entry. */
  id: number;
  /** ISO timestamp when the action occurred. */
  timestamp: string;
  /** Entity type affected. */
  entity: AuditEntity;
  /** Action taken on the entity. */
  action: AuditAction;
  /** ID of the affected entity. */
  entityId: number;
  /** Actor role performing the action (as per mock auth). */
  actorRole: 'sorcerer' | 'support' | 'observer';
  /** Optional actor rank if role is sorcerer. */
  actorRank?: string;
  /** Short, human-readable summary of the change. */
  summary?: string;
}
