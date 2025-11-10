/**
 * @fileoverview Utilities to format audit log entries into human-readable Spanish sentences.
 */
import type { AuditEntry } from '../types/audit';
import { t } from '../i18n';

/**
 * Formats a single AuditEntry into a natural Spanish sentence.
 *
 * Contract:
 * - Input: AuditEntry with fields { action, entity, summary, actorName, ... }
 * - Output: string like "Se creó una misión que atiende Rot Curse".
 * - If specific names cannot be extracted, falls back to generic entity label.
 */
export function formatAuditLine(e: AuditEntry): string {
  const base: Record<AuditEntry['action'], string> = {
    create: t('audit.base.create'),
    update: t('audit.base.update'),
    delete: t('audit.base.delete'),
  } as const;

  const head = base[e.action] ?? '';
  const summary = e.summary ?? '';

  const extractAfter = (text: string, marker: RegExp) => {
    const m = text.match(marker);
    return m && m[1] ? m[1] : undefined;
  };

  if (e.entity === 'sorcerer') {
    const name = extractAfter(summary, /hechicero\s+(.+)$/i);
    return name ? `${head} al ${t('entity.sorcerer')} ${name}` : `${head} ${t('phrase.aMasc')} ${t('entity.sorcerer')}`;
  }
  if (e.entity === 'curse') {
    // Acepta variantes con y sin acento (maldición / maldicion)
    const name = extractAfter(summary, /maldici[oó]n\s+(.+)$/i) || extractAfter(summary, /maldicion\s+(.+)$/i);
    return name ? `${head} la ${t('entity.curse')} ${name}` : `${head} ${t('phrase.aFem')} ${t('entity.curse')}`;
  }
  // mission
  const m = summary.match(/(atiende|que atendía)\s+(.+)$/i);
  if (m && m[2]) {
    const curseName = m[2];
    return `${head} ${t('phrase.aFem')} ${t('entity.mission')} ${t('phrase.thatAttends')} ${curseName}`;
  }
  return `${head} ${t('phrase.aFem')} ${t('entity.mission')}`;
}
