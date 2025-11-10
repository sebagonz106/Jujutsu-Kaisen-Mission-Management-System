import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mock/handlers';
import { apiClient, setAccessToken } from './client';
import { curseApi } from './curseApi';
import { missionApi } from './missionApi';
import { auditApi } from './auditApi';
import { CURSE_GRADE, CURSE_TYPE, CURSE_STATE, CURSE_DANGER_LEVEL } from '../types/curse';
import { MISSION_STATE, MISSION_URGENCY } from '../types/mission';

// MSW server with the same handlers used by the app
const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  // Ensure axios has a full baseURL for Node tests so MSW can intercept
  apiClient.defaults.baseURL = 'http://localhost';
  // Give ourselves support role to pass mutation checks
  setAccessToken('MOCK_TOKEN:support:especial:Tester');
});

afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('audit integration', () => {
  it('creates audit entries and paginates with cursor', async () => {
    // Create three curses
    await curseApi.create({
      nombre: 'Alpha',
      fechaYHoraDeAparicion: new Date().toISOString(),
      grado: CURSE_GRADE.grado_2,
      tipo: CURSE_TYPE.maligna,
      estadoActual: CURSE_STATE.activa,
      nivelPeligro: CURSE_DANGER_LEVEL.moderado,
      ubicacionDeAparicion: 'Tokyo',
    });
    await curseApi.create({
      nombre: 'Beta',
      fechaYHoraDeAparicion: new Date().toISOString(),
      grado: CURSE_GRADE.especial,
      tipo: CURSE_TYPE.maligna,
      estadoActual: CURSE_STATE.activa,
      nivelPeligro: CURSE_DANGER_LEVEL.alto,
      ubicacionDeAparicion: 'Kyoto',
    });
    // Create a mission that references both (to also generate mission audit)
    await missionApi.create({
      startAt: new Date().toISOString(),
      endAt: undefined,
      locationId: 99,
      state: MISSION_STATE.pending,
      events: '',
      collateralDamage: '',
      urgency: MISSION_URGENCY.planned,
      sorcererIds: [],
      curseIds: [1, 2],
    });

    // Page 1: get the 2 newest audit entries
    const page1 = await auditApi.list({ limit: 2 });
    expect(page1.length).toBeGreaterThanOrEqual(1);
    if (page1.length >= 2) {
      const olderCursor = page1[page1.length - 1].id;
      const page2 = await auditApi.list({ limit: 2, cursor: olderCursor });
      // Ensure no overlap: every id in page2 should be < olderCursor
      for (const e of page2) {
        expect(e.id).toBeLessThan(olderCursor);
      }
    }
  });
});
