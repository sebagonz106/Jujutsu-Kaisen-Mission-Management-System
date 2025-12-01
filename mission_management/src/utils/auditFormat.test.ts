import { describe, it, expect } from 'vitest';
import type { AuditEntry } from '../types/audit';
import { formatAuditLine } from './auditFormat';

function e(partial: Partial<AuditEntry>): AuditEntry {
  const base: AuditEntry = {
    id: 1,
    action: 'create',
    entity: 'mision',
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
    const entry = e({ entity: 'hechicero', action: 'create', summary: 'hechicero Satoru Gojo' });
    expect(formatAuditLine(entry)).toBe('Se añadió al hechicero Satoru Gojo');
  });

  it('formats curse with accent', () => {
    const entry = e({ entity: 'maldicion', action: 'update', summary: 'maldición Rot Curse' });
    expect(formatAuditLine(entry)).toBe('Se modificó la maldición Rot Curse');
  });

  it('formats curse without accent', () => {
    const entry = e({ entity: 'maldicion', action: 'delete', summary: 'maldicion Hanami' });
    expect(formatAuditLine(entry)).toBe('Se eliminó la maldición Hanami');
  });

  it('formats mission with attends', () => {
    const entry = e({ entity: 'mision', action: 'create', summary: 'atiende Rot Curse' });
    expect(formatAuditLine(entry)).toBe('Se añadió una misión que atiende Rot Curse');
  });

  it('formats mission with que atendía', () => {
    const entry = e({ entity: 'mision', action: 'update', summary: 'que atendía Jogo' });
    expect(formatAuditLine(entry)).toBe('Se modificó una misión que atiende Jogo');
  });

  it('falls back for mission without curse', () => {
    const entry = e({ entity: 'mision', action: 'create', summary: 'sin detalles' });
    expect(formatAuditLine(entry)).toBe('Se añadió una misión');
  });

  it('falls back for curse without name', () => {
    const entry = e({ entity: 'maldicion', action: 'create', summary: 'maldición' });
    expect(formatAuditLine(entry)).toBe('Se añadió una maldición');
  });

  it('falls back for sorcerer without name', () => {
    const entry = e({ entity: 'hechicero', action: 'create', summary: 'hechicero' });
    expect(formatAuditLine(entry)).toBe('Se añadió un hechicero');
  });
});
