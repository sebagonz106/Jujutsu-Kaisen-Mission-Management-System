# Mission Management Frontend (React + TS + Vite)

Este README resume la arquitectura, decisiones y cómo correr el proyecto con mock API o backend real. El frontend está en inglés; los modelos se alinean con el backend ASP.NET (nombres adaptados a camelCase donde aplica).

## Stack y dependencias clave
- React 19, TypeScript, Vite
- React Router
- Axios (cliente HTTP) con interceptores
- TanStack React Query (cache/CRUD, estados network)
- React Hook Form + Zod (formularios y validación)
- Sonner (toasts)
- MSW (Mock Service Worker) para simular la API

## Estructura principal
- `src/api/`
  - `client.ts`: axios instance, Authorization header, baseURL desde `VITE_API_URL`.
  - `authApi.ts`, `sorcererApi.ts`, `curseApi.ts`, `missionApi.ts`: CRUD y auth.
  - `mock/` (MSW): `data.ts` (in-memory), `handlers.ts` (endpoints), `server.ts` (worker).
- `src/context/`
  - `AuthContextInstance.ts`: tipos y contexto de auth.
  - `AuthContext.tsx`: `AuthProvider` (login/logout, token en memoria).
- `src/hooks/` `useAuth`, `useSorcerers`, `useCurses`, `useMissions`.
- `src/pages/`
  - `LoginPage.tsx`: login con RHF + Zod, toasts.
  - `sorcerers/`, `curses/`, `missions/`: tablas simples con create/edit/delete.
- `src/routes/` `AppRoutes.tsx`, `ProtectedRoute.tsx`, `RoleGuard.tsx`.
- `src/types/` `auth.ts`, `sorcerer.ts`, `curse.ts`, `mission.ts`.

## Variables de entorno
Crear un `.env.local` en la raíz del proyecto (`mission_management`):

```
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=true
```

- `VITE_USE_MOCK=true` arranca MSW en desarrollo y redirige las llamadas a la capa mock sin cambiar el código de data fetching.
- Para usar el backend real, poner `VITE_USE_MOCK=false` y asegurarse que los endpoints de ASP.NET coincidan con los usados en los `*Api.ts` (o ajustar los paths).

## Cómo ejecutar
```powershell
cd "d:\UH\Año 3\IS\Proyecto\Jujutsu-Kaisen-Mission-Management-System\mission_management"
npm install
npm run dev
```
Abrir: http://localhost:5173

## Autenticación (mock)
- Login con cualquier email y contraseña (>= 6 chars).
- El rol se infiere del email en mock:
  - contiene `support` → support
  - contiene `observer` → observer
  - el resto → sorcerer
- Tras login, puedes navegar a `/entities`, `/sorcerers`, `/curses`, `/missions`.

## Listados CRUD (MVP)
- Páginas con tablas mínimas y formulario simple para create y edit.
- Operaciones: create, update, delete.
- React Query invalida caché post‑mutación para refrescar listas.

## Integración futura con backend real
- Mantener los endpoints equivalentes en ASP.NET:
  - `POST /auth/login`, `GET /auth/me`
  - `GET/POST/PUT/DELETE /sorcerers`
  - `GET/POST/PUT/DELETE /curses`
  - `GET/POST/PUT/DELETE /missions`
- Si la API real usa otros paths (p.ej. español), cambiar sólo los archivos en `src/api/*Api.ts`.
- Implementar `/auth/refresh` (opcional) y lógica de refresh en `api/client.ts`.

## Decisiones técnicas
- En lugar de TypeScript `enum`, se usan objetos `as const` + union types (compatibles con la configuración actual de TS).
- Fechas como ISO strings en el cliente para interoperar fácilmente con ASP.NET.
- Token de acceso en memoria por simplicidad; persistencia y refresh pueden añadirse después.

## Rutas disponibles
- `/login` (pública)
- protegidas por sesión: `/entities`, `/sorcerers`, `/curses`, `/missions`, dashboards de ejemplo.

## Scripts útiles
- `npm run dev` — arranque local con HMR.
- `npm run build` — build de producción.
- `npm run typecheck` — chequeo de tipos TS.
- `npm run test` — framework de pruebas (Vitest) ya configurado, pendiente de tests.

## Roadmap siguiente
1. Role guards por vista/dashboards.
2. Formularios con RHF + Zod para Sorcerers/Curses/Missions.
3. Estados vacíos, skeletons y manejo de errores global.
4. Setup de pruebas con MSW en Vitest (handlers compartidos) y casos de autenticación.
5. Documentar contratos API definitivos con backend.

---

Este documento se actualizará a medida que avancemos con la integración y refinamientos.
