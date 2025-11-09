import { http, HttpResponse } from 'msw';
import { sorcerers, curses, missions, createSorcerer, updateSorcerer, removeSorcerer, createCurse, updateCurse, removeCurse, createMission, updateMission, removeMission, createAuditEntry, auditLog } from './data';
import type { Sorcerer } from '../../types/sorcerer';
import type { Curse } from '../../types/curse';
import type { Mission } from '../../types/mission';
import type { AuditEntry } from '../../types/audit';
import type { LoginRequest, LoginResponse, MeResponse, RegisterRequest, RegisterResponse } from '../../types/auth';

// --- Helpers to simulate backend auth/authorization ---
type MockUser = { role: 'sorcerer' | 'support' | 'observer'; rank?: string; name?: string };

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

// Only allow mutations (POST/PUT/DELETE) for support or sorcerers with rank 'alto' or 'especial'.
const forbidIfNotHighRankSorcerer = (req: Request) => {
  const user = parseUserFromToken(req.headers.get('authorization'));
  const allowedRanks = ['alto', 'especial'];
  if (!user) return HttpResponse.json({ message: 'Forbidden: missing or invalid token.' }, { status: 403 });
  // Allow support role to perform mutations.
  if (user.role === 'support') return null;
  if (user.role !== 'sorcerer') return HttpResponse.json({ message: 'Forbidden: only sorcerers or support can mutate entities.' }, { status: 403 });
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
const actorFromReq = (req: Request) => parseUserFromToken(req.headers.get('authorization')) ?? { role: 'observer', rank: 'novato' };

const pushAudit = (entity: AuditEntry['entity'], action: AuditEntry['action'], entityId: number, req: Request, summary?: string) => {
  const actor = actorFromReq(req);
  createAuditEntry({ entity, action, entityId, actorRole: actor.role, actorRank: actor.rank, actorName: actor.name, summary });
};

// Helper to select highest-grade curse name for a mission
const curseGradeRank: Record<string, number> = {
  especial: 5,
  semi_especial: 4,
  grado_1: 1,
  grado_2: 2,
  grado_3: 3,
};
const getTopCurseName = (ids: (number | string)[] | undefined): string | undefined => {
  if (!ids || ids.length === 0) return undefined;
  const numIds = ids.map((x) => Number(x)).filter((n) => !Number.isNaN(n));
  if (numIds.length === 0) return undefined;
  const list = curses.filter((c) => numIds.includes(c.id));
  if (list.length === 0) return undefined;
  list.sort((a, b) => (curseGradeRank[b.grado] ?? 0) - (curseGradeRank[a.grado] ?? 0));
  return list[0]?.nombre;
};

// Use relative paths so MSW intercepts regardless of VITE_API_URL base.
// This avoids mismatch issues between axios baseURL and handler URLs.

export const handlers = [
  // Auth
  http.post('/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    const userRole: LoginResponse['user']['role'] = body.email.includes('observer')
      ? 'observer'
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
    // Always assign observer role in mock
    const resp: RegisterResponse = {
      accessToken: 'MOCK_TOKEN:observer:novato',
      user: { id: Date.now(), role: 'observer', name: body.name, rank: 'novato' },
    };
    return HttpResponse.json(resp, { status: 201 });
  }),
  // Sorcerers
  http.get('/sorcerers', () => HttpResponse.json(sorcerers)),
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
  http.get('/curses', () => HttpResponse.json(curses)),
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
  http.get('/missions', () => HttpResponse.json(missions)),
  http.get('/missions/:id', ({ params }) => {
    const id = Number(params.id);
    const found = missions.find((m) => m.id === id);
    return found ? HttpResponse.json(found) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.post('/missions', async ({ request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const body = (await request.json()) as Omit<Mission, 'id'>;
    const validated = validateMissionPayload(body);
    if (!validated.ok) return HttpResponse.json({ message: validated.error }, { status: 400 });
    const created = createMission(body);
    // Try created.curseIds first, then fall back to payload (which may contain string ids)
    const payloadCurseIds = Array.isArray((body as unknown as { curseIds?: unknown }).curseIds)
      ? (body as unknown as { curseIds?: (number | string)[] }).curseIds
      : undefined;
    const curseIdsSource = created.curseIds ?? payloadCurseIds;
    const curseName = getTopCurseName(curseIdsSource);
    const detail = curseName ? `atiende ${curseName}` : `sin maldición asociada`;
    pushAudit('mission', 'create', created.id, request, `Creó misión — ${detail}`);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put('/missions/:id', async ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const body = (await request.json()) as Partial<Omit<Mission, 'id'>>;
    // merge current mission to allow validation with partial patch
    const current = missions.find(m => m.id === id);
    if (!current) return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    const merged = { ...current, ...body } as Omit<Mission, 'id'>;
    const validated = validateMissionPayload(merged);
    if (!validated.ok) return HttpResponse.json({ message: validated.error }, { status: 400 });
    const updated = updateMission(id, body);
    if (updated) {
      const curseName = getTopCurseName(updated.curseIds);
      const detail = curseName ? `atiende ${curseName}` : `sin maldición asociada`;
      pushAudit('mission', 'update', id, request, `Actualizó misión — ${detail}`);
    }
    return updated ? HttpResponse.json(updated) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/missions/:id', ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const current = missions.find(m => m.id === id);
    const curseName = current ? getTopCurseName(current.curseIds) : undefined;
    const detail = curseName ? `que atendía ${curseName}` : `sin maldición asociada`;
    const ok = removeMission(id);
    if (ok) pushAudit('mission', 'delete', id, request, `Eliminó misión — ${detail}`);
    return ok ? new HttpResponse(null, { status: 204 }) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  // Audit endpoint
  http.get('/audit', ({ request }) => {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : 50;
    return HttpResponse.json(auditLog.slice(0, limit));
  }),
];
