import { http, HttpResponse } from 'msw';
import { sorcerers, curses, missions, locations, techniques, createSorcerer, updateSorcerer, removeSorcerer, createCurse, updateCurse, removeCurse, createMission, updateMission, removeMission, createAuditEntry, auditLog, createLocation, updateLocation, removeLocation, createTechnique, updateTechnique, removeTechnique } from './data';
import type { Sorcerer } from '../../types/sorcerer';
import type { Curse } from '../../types/curse';
import type { Mission } from '../../types/mission';
import type { AuditEntry } from '../../types/audit';
import type { Location } from '../../types/location';
import type { Technique } from '../../types/technique';
import type { LoginRequest, LoginResponse, MeResponse, RegisterRequest, RegisterResponse } from '../../types/auth';

// --- Helpers to simulate backend auth/authorization ---
type MockUser = { role: 'sorcerer' | 'support' | 'admin'; rank?: string; name?: string };

const parseUserFromToken = (authHeader?: string | null): MockUser | null => {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(.*)$/i);
  if (!m) return null;
  const token = m[1];
  // Token format in mock: MOCK_TOKEN[:role[:rank[:name]]]
  const parts = token.split(':');
  const role = parts[1] as MockUser['role'] | undefined;
  const rank = parts[2];
  const name = parts[3];
  if (!role) return null;
  return { role, rank, name };
};

// Only allow mutations (POST/PUT/DELETE) for admin, support or sorcerers with rank 'alto' or 'especial'.
const forbidIfNotHighRankSorcerer = (req: Request) => {
  // In mock mode, if no token is provided we default to support to keep DX smooth.
  const user = parseUserFromToken(req.headers.get('authorization')) ?? { role: 'support', rank: 'especial' } as MockUser;
  const allowedRanks = ['alto', 'especial'];
  // Allow admin role full access.
  if (user.role === 'admin') return null;
  // Allow support role to perform mutations.
  if (user.role === 'support') return null;
  if (user.role !== 'sorcerer') return HttpResponse.json({ message: 'Forbidden: only sorcerers, support or admin can mutate entities.' }, { status: 403 });
  if (!user.rank || !allowedRanks.includes(user.rank)) return HttpResponse.json({ message: 'Forbidden: insufficient sorcerer rank.' }, { status: 403 });
  return null;
};

// --- Validation rules for mission payload ---
// Business rules enforced server-side to mirror client logic:
// 1. urgency is REQUIRED when state === 'pending' and must be absent otherwise (optional rule: we allow presence but ignore when not pending).
// 2. events & collateralDamage are REQUIRED (non-empty trimmed) when state in success|failure|canceled.
// 3. When state is pending, events & collateralDamage must be empty strings (we normalize empty if provided).
const validateMissionPayload = (
  body: Omit<Mission, 'id'> | Partial<Omit<Mission, 'id'>>,
): { ok: true; normalized: Omit<Mission, 'id'> | Partial<Omit<Mission, 'id'>> } | { ok: false; error: string } => {
  const state = body.state as Mission['state'];
  if (!state) return { ok: false, error: 'Missing state' };
  const isPending = state === 'pending';
  const isFinished = ['success', 'failure', 'canceled'].includes(state);
  // urgency validation
  if (isPending) {
    if (!body.urgency) return { ok: false, error: 'urgency required for pending missions' };
  }
  // finished missions must have events & collateralDamage
  if (isFinished) {
    if (!body.events || String(body.events).trim() === '') return { ok: false, error: 'events required for finished missions' };
    if (!body.collateralDamage || String(body.collateralDamage).trim() === '') return { ok: false, error: 'collateralDamage required for finished missions' };
  }
  // Normalize empty fields when pending
  const normalized = { ...body };
  if (isPending) {
    normalized.events = '';
    normalized.collateralDamage = '';
  }
  return { ok: true, normalized };
};

// Helper to parse user for audit trail.
const actorFromReq = (req: Request) => parseUserFromToken(req.headers.get('authorization')) ?? { role: 'support', rank: 'novato' };

const pushAudit = (entity: AuditEntry['entity'], action: AuditEntry['action'], entityId: number, req: Request, summary?: string) => {
  const actor = actorFromReq(req);
  createAuditEntry({ entity, action, entityId, actorRole: actor.role, actorRank: actor.rank, actorName: actor.name, summary });
};

// Type guard for backend-style technique payloads in PascalCase
function isBackendTechniquePayload(v: unknown): v is { Nombre?: unknown; Tipo?: unknown; EfectividadProm?: unknown; CondicionesDeUso?: unknown } {
  return typeof v === 'object' && v !== null && (
    'Nombre' in v || 'Tipo' in v || 'EfectividadProm' in v || 'CondicionesDeUso' in v
  );
}

// Type guard for backend-style mission payloads (Spanish camelCase)
function isBackendMissionPayload(v: unknown): v is {
  fechaYHoraDeInicio?: unknown;
  fechaYHoraDeFin?: unknown;
  ubicacionId?: unknown;
  estado?: unknown;
  eventosOcurridos?: unknown;
  dannosColaterales?: unknown;
  nivelUrgencia?: unknown;
} {
  return typeof v === 'object' && v !== null && (
    'fechaYHoraDeInicio' in v || 'ubicacionId' in v || 'estado' in v || 'nivelUrgencia' in v
  );
}

// Helper to select highest-grade curse name for a mission
const curseGradeRank: Record<string, number> = {
  especial: 5,
  semi_especial: 4,
  grado_1: 1,
  grado_2: 2,
  grado_3: 3,
};
const getTopCurseName = (idOrIds: number | (number | string)[] | undefined): string | undefined => {
  if (idOrIds === undefined || idOrIds === null) return undefined;
  let numIds: number[] = [];
  if (typeof idOrIds === 'number') numIds = [idOrIds];
  else if (Array.isArray(idOrIds)) numIds = idOrIds.map(x => Number(x)).filter(n => !Number.isNaN(n));
  if (numIds.length === 0) return undefined;
  const list = curses.filter((c) => numIds.includes(c.id));
  if (list.length === 0) return undefined;
  list.sort((a, b) => (curseGradeRank[b.grado] ?? 0) - (curseGradeRank[a.grado] ?? 0));
  return list[0]?.nombre;
};

// Helper to convert frontend Mission format to backend PascalCase format
const toBackendMission = (m: Mission): any => {
  const stateToBackend: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'EnProgreso',
    success: 'CompletadaConExito',
    failure: 'CompletadaConFracaso',
    canceled: 'Cancelada',
  };
  const urgencyToBackend: Record<string, string> = {
    planned: 'Planificada',
    urgent: 'Urgente',
    critical: 'EmergenciaCritica',
  };
  return {
    id: m.id,
    fechaYHoraDeInicio: m.startAt,
    fechaYHoraDeFin: m.endAt ?? null,
    ubicacionId: m.locationId,
    estado: stateToBackend[m.state] || 'Pendiente',
    eventosOcurridos: m.events ?? '',
    dannosColaterales: m.collateralDamage ?? '',
    nivelUrgencia: urgencyToBackend[m.urgency] || 'Planificada',
    maldicionId: (m as any).curseId,
  };
};

// Use relative paths so MSW intercepts regardless of VITE_API_URL base.
// This avoids mismatch issues between axios baseURL and handler URLs.

export const handlers = [
  // Auth
  http.post('/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    console.info('[MSW] /auth/login called with', { email: body.email });
    const userRole: LoginResponse['user']['role'] = body.email.includes('admin')
      ? 'admin'
      : body.email.includes('support')
      ? 'support'
      : 'sorcerer';
    // derive a mock rank for sorcerers from email tokens (for testing)
    let rank: string | undefined;
    if (userRole === 'sorcerer') {
      if (body.email.includes('especial')) rank = 'especial';
      else if (body.email.includes('alto')) rank = 'alto';
      else if (body.email.includes('medio')) rank = 'medio';
      else if (body.email.includes('aprendiz')) rank = 'aprendiz';
      else rank = 'estudiante';
    }
    const resp: LoginResponse = {
      accessToken: `MOCK_TOKEN:${userRole}${rank ? `:${rank}` : ''}`,
      user: { id: 1, role: userRole, name: 'Mock User', rank },
    };
    return HttpResponse.json(resp);
  }),
  http.get('/auth/me', ({ request }) => {
    const parsed = parseUserFromToken(request.headers.get('authorization')) ?? { role: 'support', rank: 'especial' };
    const me: MeResponse = { user: { id: 1, role: parsed.role, name: 'Mock User', rank: parsed.rank } };
    return HttpResponse.json(me);
  }),
  http.post('/auth/register', async ({ request }) => {
    const body = (await request.json()) as RegisterRequest;
    console.info('[MSW] /auth/register called with', { email: body.email });
    // Always assign support role in mock for new registrations
    const resp: RegisterResponse = {
      accessToken: 'MOCK_TOKEN:support:novato',
      user: { id: Date.now(), role: 'support', name: body.name, rank: 'novato' },
    };
    return HttpResponse.json(resp, { status: 201 });
  }),
  // Sorcerers
  http.get('/sorcerers', ({ request }) => {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const cursorParam = url.searchParams.get('cursor');
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;
    let list = sorcerers;
    if (cursorParam) {
      const cursor = Number(cursorParam);
      if (!Number.isNaN(cursor)) list = list.filter(s => s.id < cursor);
    }
    if (!limit) return HttpResponse.json({ items: list, nextCursor: null, hasMore: false });
    const slice = list.slice(0, limit);
    const hasMore = list.length > slice.length;
    const nextCursor = hasMore ? slice[slice.length - 1]?.id ?? null : null;
    return HttpResponse.json({ items: slice, nextCursor, hasMore });
  }),
  http.get('/sorcerers/:id', ({ params }) => {
    const id = Number(params.id);
    const found = sorcerers.find((s) => s.id === id);
    return found ? HttpResponse.json(found) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.post('/sorcerers', async ({ request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const body = (await request.json()) as Omit<Sorcerer, 'id'>;
    const created = createSorcerer(body);
    pushAudit('sorcerer', 'create', created.id, request, `Creó hechicero ${created.name}`);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put('/sorcerers/:id', async ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const body = (await request.json()) as Partial<Omit<Sorcerer, 'id'>>;
    const updated = updateSorcerer(id, body);
    if (updated) pushAudit('sorcerer', 'update', id, request, `Actualizó hechicero ${updated.name}`);
    return updated ? HttpResponse.json(updated) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/sorcerers/:id', ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const found = sorcerers.find(s => s.id === id);
    const ok = removeSorcerer(id);
    if (ok) pushAudit('sorcerer', 'delete', id, request, `Eliminó hechicero ${found?.name ?? id}`);
    return ok ? new HttpResponse(null, { status: 204 }) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  // Curses
  http.get('/curses', ({ request }) => {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const cursorParam = url.searchParams.get('cursor');
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;
    let list = curses;
    if (cursorParam) {
      const cursor = Number(cursorParam);
      if (!Number.isNaN(cursor)) list = list.filter(c => c.id < cursor);
    }
    if (!limit) return HttpResponse.json({ items: list, nextCursor: null, hasMore: false });
    const slice = list.slice(0, limit);
    const hasMore = list.length > slice.length;
    const nextCursor = hasMore ? slice[slice.length - 1]?.id ?? null : null;
    return HttpResponse.json({ items: slice, nextCursor, hasMore });
  }),
  http.get('/curses/:id', ({ params }) => {
    const id = Number(params.id);
    const found = curses.find((c) => c.id === id);
    return found ? HttpResponse.json(found) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.post('/curses', async ({ request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const body = (await request.json()) as Omit<Curse, 'id'>;
    const created = createCurse(body);
    pushAudit('curse', 'create', created.id, request, `Creó maldición ${created.nombre}`);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put('/curses/:id', async ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const body = (await request.json()) as Partial<Omit<Curse, 'id'>>;
    const updated = updateCurse(id, body);
    if (updated) pushAudit('curse', 'update', id, request, `Actualizó maldición ${updated.nombre}`);
    return updated ? HttpResponse.json(updated) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/curses/:id', ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const found = curses.find(c => c.id === id);
    const ok = removeCurse(id);
    if (ok) pushAudit('curse', 'delete', id, request, `Eliminó maldición ${found?.nombre ?? id}`);
    return ok ? new HttpResponse(null, { status: 204 }) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  // Missions
  http.get('/missions', ({ request }) => {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const cursorParam = url.searchParams.get('cursor');
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;
    let list = missions;
    if (cursorParam) {
      const cursor = Number(cursorParam);
      if (!Number.isNaN(cursor)) list = list.filter(m => m.id < cursor);
    }
    const backendList = list.map(toBackendMission);
    if (!limit) return HttpResponse.json({ items: backendList, nextCursor: null, hasMore: false });
    const slice = backendList.slice(0, limit);
    const hasMore = backendList.length > slice.length;
    const nextCursor = hasMore ? slice[slice.length - 1]?.id ?? null : null;
    return HttpResponse.json({ items: slice, nextCursor, hasMore });
  }),
  http.get('/missions/:id', ({ params }) => {
    const id = Number(params.id);
    const found = missions.find((m) => m.id === id);
    return found ? HttpResponse.json(toBackendMission(found)) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.get('/missions/:id/detail', ({ params }) => {
    const id = Number(params.id);
    const m = missions.find((mi) => mi.id === id);
    if (!m) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const hechiceroIds = m.sorcererIds ?? [];
    let maldicionDto = null;
    const cid = (m as any).curseId ?? (Array.isArray((m as any).curseIds) ? (m as any).curseIds[0] : undefined);
    if (cid !== undefined) {
      const c = curses.find(x => x.id === cid);
      if (c) maldicionDto = { id: c.id, nombre: c.nombre, grado: c.grado, estadoActual: c.estadoActual };
    }
    return HttpResponse.json({ success: true, mission: toBackendMission(m), hechiceroIds, maldicion: maldicionDto });
  }),
  http.post('/missions', async ({ request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const raw = (await request.json()) as unknown;
    // Accept either frontend camelCase or backend Spanish camelCase
    const body: Omit<Mission, 'id'> = ((): Omit<Mission, 'id'> => {
      if (isBackendMissionPayload(raw)) {
        return {
          startAt: String(raw.fechaYHoraDeInicio ?? new Date().toISOString()),
          endAt: raw.fechaYHoraDeFin ? String(raw.fechaYHoraDeFin) : undefined,
          locationId: Number(raw.ubicacionId ?? 0),
          state: String(raw.estado ?? 'Pendiente')
            .replace('Pendiente', 'pending')
            .replace('EnProgreso', 'in_progress')
            .replace('CompletadaConExito', 'success')
            .replace('CompletadaConFracaso', 'failure')
            .replace('Cancelada', 'canceled') as Mission['state'],
          events: String(raw.eventosOcurridos ?? ''),
          collateralDamage: String(raw.dannosColaterales ?? ''),
          urgency: String(raw.nivelUrgencia ?? 'Planificada')
            .replace('Planificada', 'planned')
            .replace('Urgente', 'urgent')
            .replace('EmergenciaCritica', 'critical') as Mission['urgency'],
          sorcererIds: [],
          curseId: undefined,
        };
      }
      return raw as Omit<Mission, 'id'>;
    })();
    const validated = validateMissionPayload(body);
    if (!validated.ok) return HttpResponse.json({ message: validated.error }, { status: 400 });
    const created = createMission(body);
    // Prefer created.curseId then fallback to payload curseId or payload.curseIds first element
    const payloadCurseId = (body as unknown as { curseId?: unknown }).curseId;
    const payloadCurseIds = Array.isArray((body as unknown as { curseIds?: unknown }).curseIds)
      ? (body as unknown as { curseIds?: (number | string)[] }).curseIds
      : undefined;
    const curseIdSource = (created as any).curseId ?? (typeof payloadCurseId === 'number' ? payloadCurseId : undefined) ?? (payloadCurseIds ? Number(payloadCurseIds[0]) : undefined);
    const curseName = getTopCurseName(curseIdSource);
    const detail = curseName ? `atiende ${curseName}` : `sin maldición asociada`;
    pushAudit('mission', 'create', created.id, request, `Creó misión — ${detail}`);
    return HttpResponse.json(toBackendMission(created), { status: 201 });
  }),
  http.put('/missions/:id', async ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const raw = (await request.json()) as unknown;
    const body: Partial<Omit<Mission, 'id'>> = ((): Partial<Omit<Mission, 'id'>> => {
      if (isBackendMissionPayload(raw)) {
        const patch: Partial<Omit<Mission, 'id'>> = {};
        if (raw.fechaYHoraDeInicio !== undefined) patch.startAt = String(raw.fechaYHoraDeInicio);
        if (raw.fechaYHoraDeFin !== undefined) patch.endAt = raw.fechaYHoraDeFin ? String(raw.fechaYHoraDeFin) : undefined;
        if (raw.ubicacionId !== undefined) patch.locationId = Number(raw.ubicacionId);
        if (raw.estado !== undefined) {
          patch.state = String(raw.estado)
            .replace('Pendiente', 'pending')
            .replace('EnProgreso', 'in_progress')
            .replace('CompletadaConExito', 'success')
            .replace('CompletadaConFracaso', 'failure')
            .replace('Cancelada', 'canceled') as Mission['state'];
        }
        if (raw.eventosOcurridos !== undefined) patch.events = String(raw.eventosOcurridos);
        if (raw.dannosColaterales !== undefined) patch.collateralDamage = String(raw.dannosColaterales);
        if (raw.nivelUrgencia !== undefined) {
          patch.urgency = String(raw.nivelUrgencia)
            .replace('Planificada', 'planned')
            .replace('Urgente', 'urgent')
            .replace('EmergenciaCritica', 'critical') as Mission['urgency'];
        }
        return patch;
      }
      return raw as Partial<Omit<Mission, 'id'>>;
    })();
    // merge current mission to allow validation with partial patch
    const current = missions.find(m => m.id === id);
    if (!current) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const merged = { ...current, ...body } as Omit<Mission, 'id'>;
    const validated = validateMissionPayload(merged);
    if (!validated.ok) return HttpResponse.json({ message: validated.error }, { status: 400 });
    const updated = updateMission(id, body);
    if (updated) {
      const curseName = getTopCurseName((updated as any).curseId ?? undefined);
      const detail = curseName ? `atiende ${curseName}` : `sin maldición asociada`;
      pushAudit('mission', 'update', id, request, `Actualizó misión — ${detail}`);
    }
    return updated ? HttpResponse.json(toBackendMission(updated)) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/missions/:id', ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const current = missions.find(m => m.id === id);
    const curseName = current ? getTopCurseName((current as any).curseId ?? undefined) : undefined;
    const detail = curseName ? `que atendía ${curseName}` : `sin maldición asociada`;
    const ok = removeMission(id);
    if (ok) pushAudit('mission', 'delete', id, request, `Eliminó misión — ${detail}`);
    return ok ? new HttpResponse(null, { status: 204 }) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  // Audit endpoint
  http.get('/audit', ({ request }) => {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const cursorParam = url.searchParams.get('cursor');
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;
    let list = auditLog;
    if (cursorParam) {
      const cursor = Number(cursorParam);
      if (!Number.isNaN(cursor)) {
        list = list.filter(e => e.id < cursor);
      }
    }
    if (!limit) return HttpResponse.json({ items: list, nextCursor: null, hasMore: false });
    const slice = list.slice(0, limit);
    const hasMore = list.length > slice.length;
    const nextCursor = hasMore ? slice[slice.length - 1]?.id ?? null : null;
    return HttpResponse.json({ items: slice, nextCursor, hasMore });
  }),

  // Locations
  http.get('/locations', ({ request }) => {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const cursorParam = url.searchParams.get('cursor');
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;
    let list = locations;
    if (cursorParam) {
      const cursor = Number(cursorParam);
      if (!Number.isNaN(cursor)) list = list.filter(l => l.id < cursor);
    }
    if (!limit) return HttpResponse.json({ items: list, nextCursor: null, hasMore: false });
    const slice = list.slice(0, limit);
    const hasMore = list.length > slice.length;
    const nextCursor = hasMore ? slice[slice.length - 1]?.id ?? null : null;
    return HttpResponse.json({ items: slice, nextCursor, hasMore });
  }),
  http.get('/locations/:id', ({ params }) => {
    const id = Number(params.id);
    const found = locations.find(l => l.id === id);
    return found ? HttpResponse.json(found) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.post('/locations', async ({ request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const body = (await request.json()) as Omit<Location, 'id'>;
    if (!body.nombre || String(body.nombre).trim().length < 2) {
      return HttpResponse.json({ message: 'Nombre requerido (>=2)' }, { status: 400 });
    }
    const created = createLocation({ nombre: String(body.nombre).trim() });
    pushAudit('location', 'create', created.id, request, `Creó ubicación ${created.nombre}`);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put('/locations/:id', async ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const body = (await request.json()) as Partial<Omit<Location, 'id'>>;
    if (body.nombre !== undefined && String(body.nombre).trim().length < 2) {
      return HttpResponse.json({ message: 'Nombre demasiado corto' }, { status: 400 });
    }
    const updated = updateLocation(id, body);
    if (updated) pushAudit('location', 'update', id, request, `Actualizó ubicación ${updated.nombre}`);
    return updated ? HttpResponse.json(updated) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/locations/:id', ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const found = locations.find(l => l.id === id);
    const ok = removeLocation(id);
    if (ok) pushAudit('location', 'delete', id, request, `Eliminó ubicación ${found?.nombre ?? id}`);
    return ok ? new HttpResponse(null, { status: 204 }) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  // Techniques
  http.get('/techniques', ({ request }) => {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const cursorParam = url.searchParams.get('cursor');
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;
    let list = techniques;
    if (cursorParam) {
      const cursor = Number(cursorParam);
      if (!Number.isNaN(cursor)) list = list.filter(t => t.id < cursor);
    }
    if (!limit) return HttpResponse.json({ items: list, nextCursor: null, hasMore: false });
    const slice = list.slice(0, limit);
    const hasMore = list.length > slice.length;
    const nextCursor = hasMore ? slice[slice.length - 1]?.id ?? null : null;
    return HttpResponse.json({ items: slice, nextCursor, hasMore });
  }),
  http.get('/techniques/:id', ({ params }) => {
    const id = Number(params.id);
    const found = techniques.find(t => t.id === id);
    return found ? HttpResponse.json(found) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.post('/techniques', async ({ request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
  const raw = (await request.json()) as unknown;
    // Accept either camelCase or PascalCase payloads
    const body: Omit<Technique, 'id'> = ((): Omit<Technique, 'id'> => {
      if (isBackendTechniquePayload(raw)) {
        return {
          nombre: String(raw.Nombre ?? ''),
          tipo: raw.Tipo as Technique['tipo'],
          efectividadProm: Number(raw.EfectividadProm ?? 0),
          condicionesDeUso: String(raw.CondicionesDeUso ?? ''),
        };
      }
      return raw as Omit<Technique, 'id'>;
    })();
    const eff = Number(body.efectividadProm);
    if (Number.isNaN(eff) || eff < 0 || eff > 100) {
      return HttpResponse.json({ message: 'efectividadProm debe estar entre 0 y 100' }, { status: 400 });
    }
    const allowedTypes = ['amplificacion', 'dominio', 'restriccion', 'soporte'];
    if (!allowedTypes.includes(String(body.tipo))) {
      return HttpResponse.json({ message: 'tipo inválido' }, { status: 400 });
    }
    const created = createTechnique({
      nombre: String(body.nombre),
      tipo: body.tipo,
      efectividadProm: eff,
      condicionesDeUso: body.condicionesDeUso ?? 'ninguna',
    });
    pushAudit('technique', 'create', created.id, request, `Creó técnica ${created.nombre}`);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put('/techniques/:id', async ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
  const raw = (await request.json()) as unknown;
    // Accept either camelCase or PascalCase payloads
    const body: Partial<Omit<Technique, 'id'>> = ((): Partial<Omit<Technique, 'id'>> => {
      if (isBackendTechniquePayload(raw)) {
        const patch: Partial<Omit<Technique, 'id'>> = {};
        if (raw.Nombre !== undefined) patch.nombre = String(raw.Nombre);
        if (raw.Tipo !== undefined) patch.tipo = raw.Tipo as Technique['tipo'];
        if (raw.EfectividadProm !== undefined) patch.efectividadProm = Number(raw.EfectividadProm);
        if (raw.CondicionesDeUso !== undefined) patch.condicionesDeUso = String(raw.CondicionesDeUso);
        return patch;
      }
      return raw as Partial<Omit<Technique, 'id'>>;
    })();
    if (body.efectividadProm !== undefined) {
      const eff = Number(body.efectividadProm);
      if (Number.isNaN(eff) || eff < 0 || eff > 100) {
        return HttpResponse.json({ message: 'efectividadProm debe estar entre 0 y 100' }, { status: 400 });
      }
    }
    const updated = updateTechnique(id, body);
    if (updated) pushAudit('technique', 'update', id, request, `Actualizó técnica ${updated.nombre}`);
    return updated ? HttpResponse.json(updated) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/techniques/:id', ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const found = techniques.find(t => t.id === id);
    const ok = removeTechnique(id);
    if (ok) pushAudit('technique', 'delete', id, request, `Eliminó técnica ${found?.nombre ?? id}`);
    return ok ? new HttpResponse(null, { status: 204 }) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
];
