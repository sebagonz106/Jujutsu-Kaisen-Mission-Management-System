/**
 * @fileoverview Type definitions for audit logging entries.
 *
 * Captures who did what to which entity and when, with a short summary.
 */

/** Supported entity kinds that can be audited (backend uses Spanish names). */
export type AuditEntity = 'hechicero' | 'maldicion' | 'mision' | 'ubicacion' | 'tecnica';

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
  /** Entity type affected (Spanish: hechicero, maldicion, mision, ubicacion, tecnica). */
  entity: AuditEntity;
  /** Action taken on the entity. */
  action: AuditAction;
  /** ID of the affected entity. */
  entityId: number;
  /** Actor role performing the action. */
  actorRole: 'sorcerer' | 'support' | 'admin' | string;
  /** Optional actor rank if role is sorcerer. */
  actorRank?: string;
  /** Optional actor name when available. */
  actorName?: string;
  /** Short, human-readable summary of the change. */
  summary?: string;
}
