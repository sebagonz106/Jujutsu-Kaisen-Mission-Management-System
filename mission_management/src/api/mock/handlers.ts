import { http, HttpResponse } from 'msw';
import { sorcerers, curses, missions, createSorcerer, updateSorcerer, removeSorcerer, createCurse, updateCurse, removeCurse, createMission, updateMission, removeMission } from './data';
import type { Sorcerer } from '../../types/sorcerer';
import type { Curse } from '../../types/curse';
import type { Mission } from '../../types/mission';
import type { LoginRequest, LoginResponse, MeResponse, RegisterRequest, RegisterResponse } from '../../types/auth';

// --- Helpers to simulate backend auth/authorization ---
type MockUser = { role: 'sorcerer' | 'support' | 'observer'; rank?: string };

const parseUserFromToken = (authHeader?: string | null): MockUser | null => {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(.*)$/i);
  if (!m) return null;
  const token = m[1];
  // Token format in mock: MOCK_TOKEN[:role[:rank]]
  const parts = token.split(':');
  const role = parts[1] as MockUser['role'] | undefined;
  const rank = parts[2];
  if (!role) return null;
  return { role, rank };
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
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put('/sorcerers/:id', async ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const body = (await request.json()) as Partial<Omit<Sorcerer, 'id'>>;
    const updated = updateSorcerer(id, body);
    return updated ? HttpResponse.json(updated) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/sorcerers/:id', ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const ok = removeSorcerer(id);
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
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put('/curses/:id', async ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const body = (await request.json()) as Partial<Omit<Curse, 'id'>>;
    const updated = updateCurse(id, body);
    return updated ? HttpResponse.json(updated) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/curses/:id', ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const ok = removeCurse(id);
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
    const created = createMission(body);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put('/missions/:id', async ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const body = (await request.json()) as Partial<Omit<Mission, 'id'>>;
    const updated = updateMission(id, body);
    return updated ? HttpResponse.json(updated) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/missions/:id', ({ params, request }) => {
    const forbid = forbidIfNotHighRankSorcerer(request);
    if (forbid) return forbid;
    const id = Number(params.id);
    const ok = removeMission(id);
    return ok ? new HttpResponse(null, { status: 204 }) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
];
