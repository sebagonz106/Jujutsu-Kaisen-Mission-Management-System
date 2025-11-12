import type { Sorcerer } from '../../types/sorcerer';
import type { Curse } from '../../types/curse';
import type { Mission } from '../../types/mission';
import type { Location } from '../../types/location';
import type { Technique } from '../../types/technique';
import type { AuditEntry } from '../../types/audit';
import { MISSION_STATE, MISSION_URGENCY } from '../../types/mission';
import { CURSE_GRADE, CURSE_TYPE, CURSE_STATE, CURSE_DANGER_LEVEL } from '../../types/curse';
import { SORCERER_GRADE, SORCERER_STATUS } from '../../types/sorcerer';

let sorcererId = 3;
let curseId = 3;
let missionId = 2;
let locationId = 2;
let techniqueId = 2;
let auditId = 0;

export const sorcerers: Sorcerer[] = [
  { id: 1, name: 'Yuta Okkotsu', grado: SORCERER_GRADE.alto, experiencia: 1200, estado: SORCERER_STATUS.activo, tecnicaPrincipal: 'Copy' },
  { id: 2, name: 'Maki Zenin', grado: SORCERER_GRADE.medio, experiencia: 800, estado: SORCERER_STATUS.activo, tecnicaPrincipal: 'Weapon Mastery' },
];

export const curses: Curse[] = [
  { id: 1, nombre: 'Finger of Sukuna', fechaYHoraDeAparicion: new Date().toISOString(), grado: CURSE_GRADE.especial, tipo: CURSE_TYPE.maligna, estadoActual: CURSE_STATE.activa, nivelPeligro: CURSE_DANGER_LEVEL.alto, ubicacionDeAparicion: 'Tokyo' },
  { id: 2, nombre: 'Rot Curse', fechaYHoraDeAparicion: new Date().toISOString(), grado: CURSE_GRADE.grado_2, tipo: CURSE_TYPE.residual, estadoActual: CURSE_STATE.activa, nivelPeligro: CURSE_DANGER_LEVEL.moderado, ubicacionDeAparicion: 'Kyoto' },
];

export const locations: Location[] = [
  { id: 1, nombre: 'Tokyo' },
  { id: 2, nombre: 'Kyoto' },
];

export const techniques: Technique[] = [
  { id: 1, nombre: 'Domain Expansion', tipo: 'dominio', efectividadProm: 95.5, condicionesDeUso: 'Requires barrier mastery' },
  { id: 2, nombre: 'Cursed Amplification', tipo: 'amplificacion', efectividadProm: 72.3, condicionesDeUso: 'High cursed energy' },
];

export const missions: Mission[] = [
  {
    id: 1,
    startAt: new Date().toISOString(),
    endAt: undefined,
    locationId: 101,
    state: MISSION_STATE.pending,
    events: '',
    collateralDamage: '',
    urgency: MISSION_URGENCY.planned,
    sorcererIds: [1],
    curseIds: [1],
  },
];

/**
 * In-memory audit log of recent actions.
 */
export const auditLog: AuditEntry[] = [];

/**
 * Appends a new audit entry to the in-memory log.
 */
export const createAuditEntry = (entry: Omit<AuditEntry, 'id' | 'timestamp'> & { timestamp?: string }): AuditEntry => {
  const obj: AuditEntry = {
    id: ++auditId,
    timestamp: entry.timestamp ?? new Date().toISOString(),
    entity: entry.entity,
    action: entry.action,
    entityId: entry.entityId,
    actorRole: entry.actorRole,
    actorRank: entry.actorRank,
  actorName: entry.actorName,
    summary: entry.summary,
  };
  auditLog.unshift(obj); // newest first
  // keep reasonable cap to avoid unbounded growth in dev
  if (auditLog.length > 200) auditLog.pop();
  return obj;
};

export const createSorcerer = (data: Omit<Sorcerer, 'id'>): Sorcerer => {
  const obj: Sorcerer = { id: ++sorcererId, ...data };
  sorcerers.push(obj);
  return obj;
};

export const updateSorcerer = (id: number, patch: Partial<Omit<Sorcerer, 'id'>>): Sorcerer | undefined => {
  const idx = sorcerers.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  sorcerers[idx] = { ...sorcerers[idx], ...patch };
  return sorcerers[idx];
};

export const removeSorcerer = (id: number): boolean => {
  const idx = sorcerers.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  sorcerers.splice(idx, 1);
  return true;
};

export const createCurse = (data: Omit<Curse, 'id'>): Curse => {
  const obj: Curse = { id: ++curseId, ...data };
  curses.push(obj);
  return obj;
};

export const updateCurse = (id: number, patch: Partial<Omit<Curse, 'id'>>): Curse | undefined => {
  const idx = curses.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  curses[idx] = { ...curses[idx], ...patch };
  return curses[idx];
};

export const removeCurse = (id: number): boolean => {
  const idx = curses.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  curses.splice(idx, 1);
  return true;
};

export const createMission = (data: Omit<Mission, 'id'>): Mission => {
  const obj: Mission = { id: ++missionId, ...data };
  missions.push(obj);
  return obj;
};

export const updateMission = (id: number, patch: Partial<Omit<Mission, 'id'>>): Mission | undefined => {
  const idx = missions.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  missions[idx] = { ...missions[idx], ...patch };
  return missions[idx];
};

export const removeMission = (id: number): boolean => {
  const idx = missions.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  missions.splice(idx, 1);
  return true;
};

// Locations CRUD
export const createLocation = (data: Omit<Location, 'id'>): Location => {
  const obj: Location = { id: ++locationId, ...data };
  locations.push(obj);
  return obj;
};
export const updateLocation = (id: number, patch: Partial<Omit<Location, 'id'>>): Location | undefined => {
  const idx = locations.findIndex(l => l.id === id);
  if (idx === -1) return undefined;
  locations[idx] = { ...locations[idx], ...patch };
  return locations[idx];
};
export const removeLocation = (id: number): boolean => {
  const idx = locations.findIndex(l => l.id === id);
  if (idx === -1) return false;
  locations.splice(idx, 1);
  return true;
};

// Techniques CRUD (with efectividadProm float 0..100 constraint enforced in handler)
export const createTechnique = (data: Omit<Technique, 'id'>): Technique => {
  const obj: Technique = { id: ++techniqueId, ...data };
  techniques.push(obj);
  return obj;
};
export const updateTechnique = (id: number, patch: Partial<Omit<Technique, 'id'>>): Technique | undefined => {
  const idx = techniques.findIndex(t => t.id === id);
  if (idx === -1) return undefined;
  techniques[idx] = { ...techniques[idx], ...patch };
  return techniques[idx];
};
export const removeTechnique = (id: number): boolean => {
  const idx = techniques.findIndex(t => t.id === id);
  if (idx === -1) return false;
  techniques.splice(idx, 1);
  return true;
};
