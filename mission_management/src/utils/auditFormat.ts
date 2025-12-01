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

  // Backend uses Spanish entity names: hechicero, maldicion, mision, ubicacion, tecnica
  switch (e.entity) {
    case 'hechicero': {
      const name = extractAfter(summary, /hechicero[:\s]+(.+)$/i);
      return name ? `${head} ${t('grammar.mascTo')} ${t('entity.sorcerer')} ${name}` : `${head} ${t('phrase.aMasc')} ${t('entity.sorcerer')}`;
    }
    case 'maldicion': {
      const name = extractAfter(summary, /maldici[oó]n[:\s]+(.+)$/i) || extractAfter(summary, /maldicion[:\s]+(.+)$/i);
      return name ? `${head} ${t('grammar.femArt')} ${t('entity.curse')} ${name}` : `${head} ${t('phrase.aFem')} ${t('entity.curse')}`;
    }
    case 'mision': {
      const m = summary.match(/(atiende|que atendía)\s+(.+)$/i) || summary.match(/misi[oó]n\s*#?(\d+)/i);
      if (m && m[2]) {
        return `${head} ${t('phrase.aFem')} ${t('entity.mission')} ${t('phrase.thatAttends')} ${m[2]}`;
      }
      if (m && m[1]) {
        return `${head} ${t('phrase.aFem')} ${t('entity.mission')} #${m[1]}`;
      }
      return `${head} ${t('phrase.aFem')} ${t('entity.mission')}`;
    }
    case 'ubicacion': {
      const name = extractAfter(summary, /ubicaci[oó]n[:\s]+(.+)$/i) || extractAfter(summary, /ubicacion[:\s]+(.+)$/i);
      return name ? `${head} ${t('grammar.femArt')} ${t('entity.location')} ${name}` : `${head} ${t('phrase.aFem')} ${t('entity.location')}`;
    }
    case 'tecnica': {
      const name = extractAfter(summary, /t[eé]cnica[:\s]+(.+)$/i) || extractAfter(summary, /tecnica[:\s]+(.+)$/i);
      return name ? `${head} ${t('grammar.femArt')} ${t('entity.technique')} ${name}` : `${head} ${t('grammar.femArt')} ${t('entity.technique')}`;
    }
    default:
      return summary ? `${head} ${summary}` : head;
  }
}
