import { describe, it, expect } from 'vitest';
import type { AuditEntry } from '../types/audit';
import { formatAuditLine } from './auditFormat';

function e(partial: Partial<AuditEntry>): AuditEntry {
  const base: AuditEntry = {
    id: 1,
    action: 'create',
    entity: 'mission',
    entityId: 999,
    actorRole: 'support',
    actorRank: 'alto',
    actorName: 'Tester',
  timestamp: new Date().toISOString(),
    summary: '',
  };
  return { ...base, ...partial };
}

describe('formatAuditLine', () => {
  it('formats sorcerer with name', () => {
    const entry = e({ entity: 'sorcerer', action: 'create', summary: 'hechicero Satoru Gojo' });
    expect(formatAuditLine(entry)).toBe('Se creó al hechicero Satoru Gojo');
  });

  it('formats curse with accent', () => {
    const entry = e({ entity: 'curse', action: 'update', summary: 'maldición Rot Curse' });
    expect(formatAuditLine(entry)).toBe('Se actualizó la maldición Rot Curse');
  });

  it('formats curse without accent', () => {
    const entry = e({ entity: 'curse', action: 'delete', summary: 'maldicion Hanami' });
    expect(formatAuditLine(entry)).toBe('Se eliminó la maldición Hanami');
  });

  it('formats mission with attends', () => {
    const entry = e({ entity: 'mission', action: 'create', summary: 'atiende Rot Curse' });
    expect(formatAuditLine(entry)).toBe('Se creó una misión que atiende Rot Curse');
  });

  it('formats mission with que atendía', () => {
    const entry = e({ entity: 'mission', action: 'update', summary: 'que atendía Jogo' });
    expect(formatAuditLine(entry)).toBe('Se actualizó una misión que atiende Jogo');
  });

  it('falls back for mission without curse', () => {
    const entry = e({ entity: 'mission', action: 'create', summary: 'sin detalles' });
    expect(formatAuditLine(entry)).toBe('Se creó una misión');
  });

  it('falls back for curse without name', () => {
    const entry = e({ entity: 'curse', action: 'create', summary: 'maldición' });
    expect(formatAuditLine(entry)).toBe('Se creó una maldición');
  });

  it('falls back for sorcerer without name', () => {
    const entry = e({ entity: 'sorcerer', action: 'create', summary: 'hechicero' });
    expect(formatAuditLine(entry)).toBe('Se creó un hechicero');
  });
});
