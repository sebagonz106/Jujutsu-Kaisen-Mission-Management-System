# Jujutsu Kaisen Mission Management System - Frontend

A modern React + TypeScript frontend for managing sorcerers, curses, and missions. Built with Vite, featuring role-based access control, comprehensive type safety, and a polished UI with Jujutsu Kaisen theming.

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Permission Model](#permission-model)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing Different Roles](#testing-different-roles)
- [API Integration](#api-integration)
- [Scripts](#scripts)
- [Key Features](#key-features)

## 🚀 Tech Stack

- **React 19** - Modern UI framework with latest features
- **TypeScript** - Full type safety across the codebase
- **Vite** - Lightning-fast build tool and dev server
- **React Router** - Client-side routing with protected routes
- **Axios** - HTTP client with interceptors for auth and error handling
- **TanStack React Query** - Powerful data fetching, caching, and synchronization
- **React Hook Form + Zod** - Type-safe form validation
- **Tailwind CSS** - Custom JJK-themed styling with extended palette
- **Sonner** - Beautiful toast notifications
- **MSW (Mock Service Worker)** - API mocking for development and testing

## 🏗️ Architecture Overview

### Data Flow
```
Component → Hook (React Query) → API Client (Axios) → Backend/MSW
     ↓           ↓                    ↓
   UI State   Cache State        HTTP Layer
```

### Authentication Flow
1. User submits credentials via `LoginPage`
2. `authApi.login()` sends request to `/auth/login`
3. Backend returns access token + user object
4. Token stored via `setAccessToken()` and injected in Axios interceptor
5. User state stored in `AuthContext` for UI consumption
6. Protected routes check `AuthContext.user` before rendering

### Authorization Strategy
- **Route-level**: `ProtectedRoute` ensures authentication
- **Role-level**: `RoleGuard` restricts routes by user role
- **Permission-level**: `permissions.ts` utilities check fine-grained access
- **Server-enforced**: Backend (or MSW mock) returns 403 for unauthorized operations

## 🔐 Permission Model

### User Roles
- **Support**: Full CRUD access to all entities (administrative role)
- **Sorcerer**: Access based on rank
  - **High-rank** (`alto`, `especial`): Full CRUD access
  - **Low-rank** (other grades): Read-only access
- **Observer**: Read-only access to all entities

### Permission Rules
Defined in `src/utils/permissions.ts`:

```typescript
canMutate(user): boolean
  // Returns true if user can create/update/delete entities
  // Support users: ✓ Always allowed
  // Sorcerers: ✓ Only if rank is 'alto' or 'especial'
  // Observers: ✗ Never allowed

canViewEntities(user): boolean
  // Returns true if user can view entity lists
  // All roles: ✓ Always allowed

canAccessDashboard(user): boolean
  // Returns true if user can access the dashboard
  // All authenticated users: ✓ Allowed
```

### Enforcement Layers
1. **UI**: Components conditionally render mutation controls
2. **API Mock (MSW)**: `forbidIfNotHighRankSorcerer()` returns 403
3. **Backend**: Real API should mirror these permission checks

## 📁 Project Structure

  This README documents the current state of the frontend, recent changes, how to run it with the mock API (MSW) or with a real backend, and where to find key implementation details.

  ## Tech stack
  - React 19, TypeScript, Vite
  - React Router
  - Axios (HTTP client) with interceptors
  - TanStack React Query for data fetching and cache management
  - React Hook Form + Zod for forms and validation
  - Sonner for toasts
  - MSW (Mock Service Worker) for local API mocking

  ## What changed recently (latest actions)
  This project has had several feature and stability improvements applied. Key items:

  - Theming & UX
    - Tailwind theme extended with custom Jujutsu-Kaisen palette, fonts (Cinzel, Inter, Noto Serif JP) and mystical shadows.
    - Global styles and a `Layout` component were added (sidebar, navigation, role badge, logout).

  - Authentication & Mocking
    - MSW handlers were fixed to use relative paths so they reliably intercept requests in development.
    - `src/api/client.ts` uses an empty `baseURL` when mocks are enabled so MSW can intercept same-origin requests.
    - Login now redirects to the originally requested page (if any) or to `/entities` on success.
    - A registration page (`/register`) was added for observer sign-ups and integrated with the mock.

  - Role-based behavior
    - `RoleGuard` and `ProtectedRoute` exist for role/route-level checks.
    - UI-level restrictions: observers are now prevented from seeing mutation controls (create/edit/delete) in entity pages (Sorcerers, Curses, Missions). See `src/pages/sorcerers/SorcerersPage.tsx`, `src/pages/curses/CursesPage.tsx`, `src/pages/missions/MissionsPage.tsx`.
    - MSW now simulates server-side authorization: mock tokens include role suffixes (e.g. `MOCK_TOKEN:observer`) and MSW handlers return 403 Forbidden for POST/PUT/DELETE when the token belongs to an `observer` role. This mirrors the real API behavior and makes tests reliable.

  - Stability and polish
    - Sonner toasts were visually themed (kept message text simple as per UX preference).
    - Modals, confirm dialogs, empty states, skeletons, and tables were implemented across entity pages.
    - Added `doc/mobile_steps.md` with a mobile-first adaptation guide (sidebar → topbar + drawer, cards for lists, accessibility notes).

  ## Project structure (high-level)
  - `src/api/`
    - `client.ts` — Axios instance and token handling
    - `authApi.ts`, `sorcererApi.ts`, `curseApi.ts`, `missionApi.ts` — HTTP wrappers
    - `mock/` — MSW `data.ts`, `handlers.ts`, `server.ts`
  - `src/context/` — `AuthContext`, provider and types
  - `src/hooks/` — `useAuth`, `useSorcerers`, `useCurses`, `useMissions`
  - `src/pages/` — `LoginPage.tsx`, `RegisterPage.tsx`, and entity pages
  - `src/components/` — `Layout`, UI primitives (Button, Modal, Table, etc.)
  - `src/routes/` — `AppRoutes.tsx`, `ProtectedRoute.tsx`, `RoleGuard.tsx`
  - `src/types/` — shared TypeScript types for auth, sorcerer, curse, mission

  ## Environment variables
  Create a `.env.local` file at the project root (`mission_management`):

  ```powershell
  VITE_API_URL=http://localhost:5000/api
  VITE_USE_MOCK=true
  ```

  - `VITE_USE_MOCK=true` starts MSW in development and keeps requests same-origin so the service worker can intercept them.
  - To use a real backend, set `VITE_USE_MOCK=false` and ensure the server implements the same endpoints and returns expected status codes (especially 403 for forbidden operations).

  ## How to run (development)
  ```powershell
  cd "d:\UH\Año 3\IS\Proyecto\Jujutsu-Kaisen-Mission-Management-System\mission_management"
  npm install
  npm run dev
  ```
  Open the app at http://localhost:5173 (Vite will pick an available port if 5173 is busy).

  ## Authentication (mock behavior)
  - Login with any email + password (>= 6 chars) while MSW is enabled.
  - In the mock, the role is inferred from the email:
    - contains `support` → support
    - contains `observer` → observer
    - otherwise → sorcerer
  - Tokens returned by the mock include a role suffix: `MOCK_TOKEN:<role>`. MSW reads the `Authorization` header to derive role and enforce server-side permissions.

  ## Authorization rules (current)
  - Route protection: `ProtectedRoute` ensures pages require authentication.
  - Role guard: use `RoleGuard` in routes that should be available to specific roles.
  - UI-level: observers are restricted from creating/updating/deleting records; they see read-only views.
  - Mock/server: POST/PUT/DELETE on `/sorcerers`, `/curses`, `/missions` return 403 for observers (MSW enforces this).

  ## How to test observer restrictions
  1. Ensure `VITE_USE_MOCK=true` and run the dev server.
  2. Login with an email containing `observer` (e.g. `anna.observer@example.com`).
  3. Visit `/sorcerers`, `/curses`, or `/missions`. You should see only read-only controls and no create/edit/delete actions.
  4. If you attempt to call a mutation route manually (e.g., via Fetch in DevTools) with the mock token for an observer, MSW will return `403 Forbidden`.

  ## Key files to inspect (recent edits)
  - `src/api/mock/handlers.ts` — MSW handlers, token parsing, and role-based 403 handling
  - `src/api/client.ts` — axios baseURL logic and Authorization header wiring
  - `src/pages/LoginPage.tsx` — login + redirect logic
  - `src/pages/RegisterPage.tsx` — registration form (observer sign-up)
  - `src/pages/sorcerers/SorcerersPage.tsx`, `src/pages/curses/CursesPage.tsx`, `src/pages/missions/MissionsPage.tsx` — UI-level role checks (hide mutate controls)
  - `doc/mobile_steps.md` — mobile adaptation guide

  ## Scripts
  - `npm run dev` — run dev server with HMR
  - `npm run build` — production build
  - `npm run typecheck` — TypeScript check
  - `npm run lint` — ESLint
  - `npm run test` — run tests (Vitest)

  ## Recommended next steps
  1. Backend enforcement: ensure the real API returns `403` for unauthorized roles for the same mutation endpoints. The frontend and MSW already treat `403` as forbidden.
  2. Centralize `canMutate` logic into a small helper (e.g. `utils/permissions.ts`) and use it across components.
  3. Add integration tests (Vitest + MSW) exercising role-based cases (observer forbidden, support allowed).
  4. Consider persistent token storage and refresh flow (`/auth/refresh`) for production.

  ---

## 📁 Project Structure

```
src/
├── api/                      # HTTP layer
│   ├── client.ts            # Axios instance, interceptors, token management
│   ├── authApi.ts           # Authentication endpoints (login, register, me)
│   ├── sorcererApi.ts       # Sorcerer CRUD operations
│   ├── curseApi.ts          # Curse CRUD operations
│   ├── missionApi.ts        # Mission CRUD operations
│   └── mock/                # MSW (Mock Service Worker)
│       ├── data.ts          # In-memory mock data
│       ├── handlers.ts      # Request handlers with permission enforcement
│       └── server.ts        # MSW worker setup
│
├── components/              # Reusable UI components
│   └── ui/                  # Base UI primitives
│
├── context/                 # React Context providers
│   ├── AuthContext.tsx      # AuthProvider component
│   └── AuthContextInstance.ts # Context definition and types
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts           # Authentication hook
│   ├── useSorcerers.ts      # Sorcerer data fetching hooks
│   ├── useCurses.ts         # Curse data fetching hooks
│   └── useMissions.ts       # Mission data fetching hooks
│
├── pages/                   # Route components
│   ├── LoginPage.tsx        # Login form
│   ├── sorcerers/           # Sorcerer management pages
│   ├── curses/              # Curse management pages
│   └── missions/            # Mission management pages
│
├── routes/                  # Routing configuration
│   ├── AppRoutes.tsx        # Route definitions
│   ├── ProtectedRoute.tsx   # Authentication guard
│   └── RoleGuard.tsx        # Role-based access guard
│
├── types/                   # TypeScript type definitions
│   ├── auth.ts              # Authentication types
│   ├── sorcerer.ts          # Sorcerer entity types
│   ├── curse.ts             # Curse entity types
│   └── mission.ts           # Mission entity types
│
├── utils/                   # Utility functions
│   └── permissions.ts       # Permission checking logic
│
├── App.tsx                  # Root component
└── main.tsx                 # Application entry point
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```powershell
# Navigate to project directory
cd "d:\UH\Año 3\IS\Proyecto\Jujutsu-Kaisen-Mission-Management-System\mission_management"

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## ⚙️ Environment Variables

Create a `.env.local` file in the project root:

```env
# API base URL (ignored when mocks are enabled)
VITE_API_URL=http://localhost:5000/api

# Enable/disable MSW mocking
VITE_USE_MOCK=true
```

### Configuration Options

- **`VITE_USE_MOCK=true`**: Enables MSW for local development
  - Intercepts all API requests
  - Uses mock data from `src/api/mock/data.ts`
  - Simulates backend authorization rules
  - No backend server required

- **`VITE_USE_MOCK=false`**: Uses real backend
  - Requires backend server running at `VITE_API_URL`
  - Backend must implement matching endpoints
  - Backend must enforce same permission rules

## 🧪 Testing Different Roles

### Using Mock API (Development)

With `VITE_USE_MOCK=true`, test different roles using email patterns:

#### Support User (Full Access)
```
Email: admin.support@example.com
Password: password123 (any password ≥6 chars)
Capabilities: ✓ Full CRUD on all entities
```

#### High-Rank Sorcerer (Full Access)
```
Email: satoru@example.com
Password: password123
Mock assigns rank: "especial"
Capabilities: ✓ Full CRUD on all entities
```

#### Low-Rank Sorcerer (Read-Only)
```
Email: yuji@example.com
Password: password123
Mock assigns rank: "medio"
Capabilities: ✓ View only, ✗ No mutations
```

#### Observer (Read-Only)
```
Email: jane.observer@example.com
Password: password123
Capabilities: ✓ View only, ✗ No mutations
```

### Mock Token Format

MSW uses the following token format:
```
MOCK_TOKEN:<role>:<rank?>
```

Example:
- `MOCK_TOKEN:support` - Support user
- `MOCK_TOKEN:sorcerer:alto` - High-rank sorcerer
- `MOCK_TOKEN:sorcerer:medio` - Mid-rank sorcerer
- `MOCK_TOKEN:observer` - Observer

### Testing Permission Enforcement

1. **UI-Level**: Log in as observer → navigate to `/sorcerers` → verify no Create/Edit/Delete buttons
2. **Server-Level**: Open DevTools → attempt POST/PUT/DELETE with observer token → verify 403 response
3. **Rank-Based**: Log in as low-rank sorcerer → verify same read-only restrictions

## 🔌 API Integration

### Mock API (MSW)

**Location**: `src/api/mock/handlers.ts`

Key handlers:
- `POST /auth/login` - Derives role from email, returns mock token
- `POST /auth/register` - Creates observer account
- `GET /auth/me` - Returns current user
- `GET /sorcerers`, `GET /curses`, `GET /missions` - List entities (all roles)
- `POST/PUT/DELETE` on entities - Returns 403 for unauthorized users

### Real Backend Integration

**Expected Endpoints**:

```
POST   /auth/login        # Returns { accessToken, user }
POST   /auth/register     # Returns { accessToken, user }
GET    /auth/me           # Returns { user }

GET    /sorcerers         # List all sorcerers
GET    /sorcerers/:id     # Get sorcerer by ID
POST   /sorcerers         # Create sorcerer (support/high-rank only)
PUT    /sorcerers/:id     # Update sorcerer (support/high-rank only)
DELETE /sorcerers/:id     # Delete sorcerer (support/high-rank only)

# Same pattern for /curses and /missions
```

**Authorization Requirements**:
- All mutation endpoints (POST/PUT/DELETE) must return `403 Forbidden` for:
  - Observers (always)
  - Low-rank sorcerers (ranks other than 'alto' or 'especial')
- Support role should have full access to all operations

**Token Handling**:
- Frontend sends token via `Authorization: Bearer <token>` header
- Backend validates token and extracts user role/rank
- Backend enforces permission rules before processing mutations

## 📜 Scripts

```powershell
npm run dev          # Start development server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run typecheck    # Run TypeScript compiler check
npm run lint         # Run ESLint
npm run test         # Run tests with Vitest
```

## ✨ Key Features

### 1. Type-Safe Data Fetching
- All API responses strongly typed
- React Query hooks provide loading/error states
- Automatic cache invalidation after mutations

### 2. Form Validation with Conditional Rules
- React Hook Form for performance
- Zod schemas for runtime validation with conditional logic
- Type inference from schemas to forms
- **Mission-specific validation**:
  - `urgency` field required only for pending missions
  - `events` and `collateralDamage` required only for completed missions (success, failure, canceled)
  - Form UI conditionally shows/hides fields based on mission state

### 3. Multi-Select Entity Assignment
- **Sorcerers and Curses assignment**: Dropdown multi-select (`MultiSelect` component) showing selected items as chips with overflow counter.
- Dynamic option lists from `useSorcerers` and `useCurses` hooks.
- Search filter inside dropdown for large lists.
- Form values automatically handled as arrays of IDs via React Hook Form `Controller`.

### 4. Permission System
- Centralized permission logic in `utils/permissions.ts`
- UI components conditionally render based on permissions
- Server-side enforcement (mock and real backend)

### 5. Spanish UI with English Internals
- All user-facing labels in Spanish.
- Internal enums remain English; mapping dictionaries translate values.
- Validation error messages shown in Spanish.
- Internal enum values and code remain in English
- Mapping dictionaries (`estadoLabel`, `urgenciaLabel`) for display

### 6. Error Handling
- Axios interceptors catch 401/403 responses
- Toast notifications for user feedback (Spanish messages)
- Graceful degradation for network errors

### 7. Theming
- Custom Tailwind configuration with JJK palette
- Custom fonts: Cinzel (headings), Inter (body), Noto Serif JP (accents)
- Mystical shadows and color scheme

### 8. Developer Experience
- Hot Module Replacement (HMR) with Vite
- ESLint + TypeScript for code quality
- Comprehensive TSDoc documentation in English
- MSW for API-independent development

## 📝 Mission Management Details

### Conditional Field Rules

The mission form implements business logic to ensure data consistency:

#### Pending Missions (`estado: 'Pendiente'`)
- **Required**: `urgency` (Urgencia) - Must specify priority level
- **Hidden**: `events`, `collateralDamage` - Cannot be filled until mission completes

#### In Progress Missions (`estado: 'En progreso'`)
- **Optional**: All detail fields
- Users can update as mission progresses

#### Completed Missions (`estado: 'Completada con éxito' | 'Completada con fracaso' | 'Cancelada'`)
- **Required**: `events` (Eventos) - Must document what happened
- **Required**: `collateralDamage` (Daños colaterales) - Must record any damage
- **Hidden**: `urgency` - No longer relevant

### Multi-Select Implementation

**Sorcerers Assignment:**
```tsx
<fieldset>
  <legend>Hechiceros asignados</legend>
  {sorcerers.map(s => (
    <label>
      <input type="checkbox" value={s.id} />
      {s.name} · {s.grado}
    </label>
  ))}
</fieldset>
```

**Curses Association:**
```tsx
<fieldset>
  <legend>Maldiciones asociadas</legend>
  {curses.map(c => (
    <label>
      <input type="checkbox" value={c.id} />
      {c.nombre} · {c.grado}
    </label>
  ))}
</fieldset>
```

### Validation Messages

All validation messages are in Spanish:
- `"La urgencia es obligatoria en misiones pendientes."`
- `"Debe detallar los eventos para misiones finalizadas."`
- `"Debe indicar los daños colaterales para misiones finalizadas."`

## 📚 Additional Documentation

- **Mobile Adaptation Guide**: `doc/mobile_steps.md`
- **Vite + React Project Structure**: `doc/vite_react_project_structure.md`

## 🛠️ Troubleshooting

### MSW Not Intercepting Requests
- Verify `VITE_USE_MOCK=true` in `.env.local`
- Check browser console for MSW worker registration
- Ensure service worker is registered (check DevTools → Application → Service Workers)

### 403 Forbidden Errors
- Verify user role/rank in DevTools → Application → Local Storage
- Check `Authorization` header in Network tab
- Review `src/api/mock/handlers.ts` for permission logic

### Type Errors
- Run `npm run typecheck` to identify issues
- Ensure all types in `src/types/` match backend contracts
- Check `tsconfig.json` for correct `paths` configuration

## 🚀 Deployment

### Build for Production
```powershell
npm run build
```

Output directory: `dist/`

### Environment Variables (Production)
Set the following in your hosting platform:
```
VITE_API_URL=https://your-backend-api.com/api
VITE_USE_MOCK=false
```

### Hosting Recommendations
- **Vercel**: Zero-config deployment for Vite apps
- **Netlify**: Simple drag-and-drop or Git integration
- **AWS S3 + CloudFront**: For enterprise deployments

## 📝 Contributing

### Code Style
- Use TypeScript for all new files
- Follow existing naming conventions (camelCase for variables/functions, PascalCase for components)
- Add TSDoc comments for exported functions/types
- Run `npm run lint` before committing

### Adding New Features
1. Define types in `src/types/`
2. Create API methods in `src/api/`
3. Add MSW handlers in `src/api/mock/handlers.ts`
4. Create React Query hooks in `src/hooks/`
5. Build UI components in `src/pages/` or `src/components/`
6. Update this README if adding major features

## 📄 License

This project is part of an academic assignment for the Software Engineering and Data Base II courses at the University of Havana.

---

**Last Updated**: November 2025