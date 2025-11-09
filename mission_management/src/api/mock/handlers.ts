import { http, HttpResponse } from 'msw';
import { sorcerers, curses, missions, createSorcerer, updateSorcerer, removeSorcerer, createCurse, updateCurse, removeCurse, createMission, updateMission, removeMission } from './data';
import type { Sorcerer } from '../../types/sorcerer';
import type { Curse } from '../../types/curse';
import type { Mission } from '../../types/mission';
import type { LoginRequest, LoginResponse, MeResponse } from '../../types/auth';

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
    const resp: LoginResponse = {
      accessToken: 'MOCK_TOKEN',
      user: { id: 1, role: userRole, name: 'Mock User', rank: 'especial' },
    };
    return HttpResponse.json(resp);
  }),
  http.get('/auth/me', () => {
    const me: MeResponse = { user: { id: 1, role: 'support', name: 'Mock User', rank: 'especial' } };
    return HttpResponse.json(me);
  }),
  // Sorcerers
  http.get('/sorcerers', () => HttpResponse.json(sorcerers)),
  http.get('/sorcerers/:id', ({ params }) => {
    const id = Number(params.id);
    const found = sorcerers.find((s) => s.id === id);
    return found ? HttpResponse.json(found) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.post('/sorcerers', async ({ request }) => {
    const body = (await request.json()) as Omit<Sorcerer, 'id'>;
    const created = createSorcerer(body);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put('/sorcerers/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as Partial<Omit<Sorcerer, 'id'>>;
    const updated = updateSorcerer(id, body);
    return updated ? HttpResponse.json(updated) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/sorcerers/:id', ({ params }) => {
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
    const body = (await request.json()) as Omit<Curse, 'id'>;
    const created = createCurse(body);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put('/curses/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as Partial<Omit<Curse, 'id'>>;
    const updated = updateCurse(id, body);
    return updated ? HttpResponse.json(updated) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/curses/:id', ({ params }) => {
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
    const body = (await request.json()) as Omit<Mission, 'id'>;
    const created = createMission(body);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put('/missions/:id', async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as Partial<Omit<Mission, 'id'>>;
    const updated = updateMission(id, body);
    return updated ? HttpResponse.json(updated) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
  http.delete('/missions/:id', ({ params }) => {
    const id = Number(params.id);
    const ok = removeMission(id);
    return ok ? new HttpResponse(null, { status: 204 }) : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
];
