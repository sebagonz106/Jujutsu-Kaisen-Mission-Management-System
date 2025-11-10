# Jujutsu Kaisen Mission Management System - Frontend

A modern React + TypeScript frontend for managing sorcerers, curses, and missions in the Jujutsu Kaisen universe. Built with Vite, featuring role-based access control, comprehensive type safety, audit logging, infinite pagination, and a polished UI with custom JJK theming.

## 📋 Table of Contents
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Permission Model](#permission-model)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing Different Roles](#testing-different-roles)
- [API Integration](#api-integration)
- [Pagination System](#pagination-system)
- [Audit Logging](#audit-logging)
- [Mission Management](#mission-management-details)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)

## 🚀 Tech Stack

- **React 19** - Modern UI framework with latest features
- **TypeScript** - Full type safety across the codebase
- **Vite** - Lightning-fast build tool and dev server
- **React Router** - Client-side routing with protected routes
- **Axios** - HTTP client with interceptors for auth and error handling
- **TanStack React Query v5** - Powerful data fetching, caching, and infinite pagination
- **React Hook Form + Zod** - Type-safe form validation with conditional rules
- **Tailwind CSS** - Custom JJK-themed styling with extended palette
- **Sonner** - Beautiful toast notifications
- **MSW (Mock Service Worker)** - API mocking with server-side pagination simulation

## 🏗️ Architecture Overview

### Data Flow
```
Component → Hook (React Query) → API Client (Axios) → pagedApi Adapter → Backend/MSW
     ↓           ↓                    ↓                      ↓
   UI State   Cache State        HTTP Layer          Normalized Response
```

### Pagination Architecture
```
Backend (paginated)  →  pagedApi.normalizePaged()  →  { items, nextCursor, hasMore }
                                     ↓
                            useInfiniteQuery hooks
                                     ↓
                          Page components (flatMap items)
```

The `pagedApi` adapter normalizes various API response shapes:
- Standard: `{ items: [], nextCursor: X, hasMore: bool }`
- Nested: `{ data: { items: [] }, meta: { nextCursor: X } }`
- Legacy REST: `{ results: [], next: X }`
- Fallback: Plain arrays (with optional client-side slicing)

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
│   ├── pagedApi.ts          # ⭐ Pagination adapter (normalizes responses)
│   ├── authApi.ts           # Authentication endpoints (login, register, me)
│   ├── auditApi.ts          # ⭐ Audit log endpoints with pagination
│   ├── sorcererApi.ts       # Sorcerer CRUD operations with pagination
│   ├── curseApi.ts          # Curse CRUD operations with pagination
│   ├── missionApi.ts        # Mission CRUD operations with pagination
│   └── mock/                # MSW (Mock Service Worker)
│       ├── data.ts          # In-memory mock data + audit log
│       ├── handlers.ts      # Request handlers with auth + pagination
│       └── server.ts        # MSW worker setup
│
├── components/              # Reusable UI components
│   ├── AuditList.tsx        # ⭐ Recent actions component (infinite scroll)
│   └── ui/                  # Base UI primitives
│       ├── MultiSelect.tsx  # ⭐ Dropdown multi-select with search
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Table.tsx
│       └── ...
│
├── context/                 # React Context providers
│   ├── AuthContext.tsx      # AuthProvider component
│   └── AuthContextInstance.ts # Context definition and types
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts           # Authentication hook
│   ├── useAudit.ts          # Fixed-size audit query with polling
│   ├── useInfiniteAudit.ts  # ⭐ Infinite audit pagination
│   ├── useSorcerers.ts      # Sorcerer CRUD hooks (cache invalidation)
│   ├── useInfiniteSorcerers.ts # ⭐ Infinite sorcerer pagination
│   ├── useCurses.ts         # Curse CRUD hooks (cache invalidation)
│   ├── useInfiniteCurses.ts # ⭐ Infinite curse pagination
│   ├── useMissions.ts       # Mission CRUD hooks (cache invalidation)
│   └── useInfiniteMissions.ts # ⭐ Infinite mission pagination
│
├── i18n/                    # ⭐ Internationalization
│   ├── index.ts             # Translation function (t())
│   └── es.ts                # Spanish translation dictionary
│
├── pages/                   # Route components
│   ├── LoginPage.tsx        # Login form
│   ├── sorcerers/           # Sorcerer management pages
│   │   └── SorcerersPage.tsx # ⭐ With infinite pagination
│   ├── curses/              # Curse management pages
│   │   └── CursesPage.tsx   # ⭐ With infinite pagination
│   └── missions/            # Mission management pages
│       └── MissionsPage.tsx # ⭐ With infinite pagination + multi-select
│
├── routes/                  # Routing configuration
│   ├── AppRoutes.tsx        # Route definitions
│   ├── ProtectedRoute.tsx   # Authentication guard
│   └── RoleGuard.tsx        # Role-based access guard
│
├── types/                   # TypeScript type definitions
│   ├── auth.ts              # Authentication types
│   ├── audit.ts             # ⭐ Audit log entry types
│   ├── sorcerer.ts          # Sorcerer entity types
│   ├── curse.ts             # Curse entity types
│   └── mission.ts           # Mission entity types
│
├── utils/                   # Utility functions
│   ├── permissions.ts       # Permission checking logic
│   ├── auditFormat.ts       # ⭐ Natural language audit formatter
│   └── auditFormat.test.ts  # ⭐ Unit tests for formatter
│
├── App.tsx                  # Root component
└── main.tsx                 # Application entry point
```

**⭐ = Recently added/significantly updated for pagination & audit features**

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

### Pagination Support

All list endpoints support cursor-based pagination:

```
GET /sorcerers?limit=20&cursor=123
GET /curses?limit=20&cursor=456
GET /missions?limit=20&cursor=789
GET /audit?limit=50&cursor=100
```

**Request Parameters:**
- `limit` (optional): Number of items per page (default varies by endpoint)
- `cursor` (optional): ID of the last item from previous page (for fetching next page)

**Response Format (Normalized by `pagedApi`):**
```typescript
{
  items: T[],           // Array of entities
  nextCursor: number | string | null,  // Cursor for next page (null if no more)
  hasMore: boolean      // Whether more pages are available
}
```

### Mock API (MSW)

**Location**: `src/api/mock/handlers.ts`

Key handlers with pagination:
- `POST /auth/login` - Derives role from email, returns mock token
- `POST /auth/register` - Creates observer account
- `GET /auth/me` - Returns current user
- `GET /sorcerers?limit&cursor` - List sorcerers (paginated)
- `GET /curses?limit&cursor` - List curses (paginated)
- `GET /missions?limit&cursor` - List missions (paginated)
- `GET /audit?limit&cursor` - List audit entries (paginated, newest first)
- `POST/PUT/DELETE` on entities - Returns 403 for unauthorized users, logs audit entry

**Pagination Behavior (MSW):**
- Filters items with `id < cursor` to simulate older-item pagination
- Returns `nextCursor` as the last item's ID (or `null` if page incomplete)
- Sets `hasMore` based on whether `nextCursor` exists

### Real Backend Integration

**Expected Endpoints**:

```
POST   /auth/login        # Returns { accessToken, user }
POST   /auth/register     # Returns { accessToken, user }
GET    /auth/me           # Returns { user }

GET    /sorcerers?limit&cursor         # List sorcerers (paginated)
GET    /sorcerers/:id                  # Get sorcerer by ID
POST   /sorcerers                      # Create (support/high-rank only)
PUT    /sorcerers/:id                  # Update (support/high-rank only)
DELETE /sorcerers/:id                  # Delete (support/high-rank only)

GET    /curses?limit&cursor            # List curses (paginated)
GET    /curses/:id                     # Get curse by ID
POST   /curses                         # Create (support/high-rank only)
PUT    /curses/:id                     # Update (support/high-rank only)
DELETE /curses/:id                     # Delete (support/high-rank only)

GET    /missions?limit&cursor          # List missions (paginated)
GET    /missions/:id                   # Get mission by ID
POST   /missions                       # Create (support/high-rank only)
PUT    /missions/:id                   # Update (support/high-rank only)
DELETE /missions/:id                   # Delete (support/high-rank only)

GET    /audit?limit&cursor             # List audit logs (paginated)
```

**Pagination Requirements:**
- Support `limit` and `cursor` query parameters
- Return responses matching one of these shapes:
  - `{ items: T[], nextCursor?: X, hasMore?: bool }` (preferred)
  - `{ data: { items: T[] }, meta: { nextCursor?: X } }`
  - `{ results: T[], next?: X }`
  - Plain array `T[]` (frontend will handle fallback with client-side slicing)

**Authorization Requirements**:
- All mutation endpoints (POST/PUT/DELETE) must return `403 Forbidden` for:
  - Observers (always)
  - Low-rank sorcerers (ranks other than 'alto' or 'especial')
- Support role should have full access to all operations

**Token Handling**:
- Frontend sends token via `Authorization: Bearer <token>` header
- Backend validates token and extracts user role/rank
- Backend enforces permission rules before processing mutations

**Audit Logging (Backend Responsibility)**:
- Track all CRUD operations on sorcerers, curses, and missions
- Store: timestamp, entity type, action, entity ID, actor info, summary
- Provide `/audit` endpoint with pagination support

## � Pagination System

### Architecture

The pagination system uses a **cursor-based approach** for efficient data fetching:

```typescript
// Normalized response shape (via pagedApi adapter)
type PagedResponse<T> = {
  items: T[];                          // Current page items
  nextCursor?: string | number | null; // Cursor for next page
  hasMore?: boolean;                   // Whether more pages exist
};
```

### Implementation Layers

#### 1. **Backend/MSW** (`src/api/mock/handlers.ts`)
- Accepts `limit` and `cursor` query parameters
- Filters data: `items.filter(item => item.id < cursor)`
- Returns last item's ID as `nextCursor` (or `null` if last page)

#### 2. **API Adapter** (`src/api/pagedApi.ts`)
- **Normalizes** various response shapes into `PagedResponse<T>`
- Supports:
  - Standard shape: `{ items, nextCursor, hasMore }`
  - Nested shape: `{ data: { items }, meta: { nextCursor } }`
  - Legacy REST: `{ results, next }`
  - **Fallback**: Plain arrays (client-side slicing if limit provided)
- **Graceful degradation** for APIs without pagination support

#### 3. **API Clients** (`src/api/*Api.ts`)
```typescript
// Example: sorcererApi.list()
async list(params?: { limit?: number; cursor?: number | string }) {
  const qp = [];
  if (params?.limit) qp.push(`limit=${params.limit}`);
  if (params?.cursor) qp.push(`cursor=${params.cursor}`);
  const qs = qp.length ? `?${qp.join('&')}` : '';
  const { data } = await apiClient.get(`/sorcerers${qs}`);
  return normalizePaged<Sorcerer>(data, { limit: params?.limit });
}
```

#### 4. **React Query Hooks** (`src/hooks/useInfinite*.ts`)
```typescript
// Example: useInfiniteSorcerers
useInfiniteQuery<PagedResponse<Sorcerer>>({
  queryKey: ['sorcerers', 'infinite', pageSize],
  queryFn: async ({ pageParam }) => {
    const cursor = pageParam ?? undefined;
    return sorcererApi.list({ limit: pageSize, cursor });
  },
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  initialPageParam: undefined,
});
```

#### 5. **UI Components** (`src/pages/*`)
```typescript
// Flatten pages and extract items
const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteSorcerers({ pageSize: 20 });
const items = data?.pages.flatMap((p) => p.items) ?? [];

// Conditional "Load More" button
{hasNextPage && (
  <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
    {isFetchingNextPage ? 'Cargando…' : 'Ver más'}
  </Button>
)}
```

### Cache Invalidation

All CRUD mutations invalidate **both base and infinite queries**:

```typescript
const create = useMutation({
  mutationFn: (payload) => sorcererApi.create(payload),
  onSuccess: () =>
    qc.invalidateQueries({
      predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'sorcerers',
    }),
});
```

This ensures:
- `useSorcerers()` (base query) refreshes
- `useInfiniteSorcerers()` (infinite query) refreshes
- UI stays consistent after create/update/delete operations

### Benefits

✅ **Scalable**: Handles large datasets efficiently  
✅ **Consistent**: Works with various backend pagination styles  
✅ **Fallback**: Degrades gracefully for non-paginated APIs  
✅ **Type-safe**: Full TypeScript support throughout  
✅ **User-friendly**: Smooth infinite scrolling UX  
✅ **Cache-coherent**: Automatic invalidation on mutations  

## 📋 Audit Logging

### Overview

The application tracks all CRUD operations on sorcerers, curses, and missions with a comprehensive audit log system.

### Features

- **Automatic instrumentation**: All mutations logged automatically in MSW handlers
- **Actor tracking**: Captures role, rank, and username (parsed from token)
- **Natural language formatting**: Spanish sentences (e.g., "Se creó un hechicero llamado Yuji")
- **Entity references**: Links to related entities (e.g., mission → curse name)
- **Real-time updates**: Polling mechanism for live audit feed
- **Infinite pagination**: Load more audit entries on demand

### Data Structure

```typescript
type AuditEntry = {
  id: number;
  timestamp: string;              // ISO timestamp
  entity: 'sorcerer' | 'curse' | 'mission';
  action: 'create' | 'update' | 'delete';
  entityId: number;               // ID of affected entity
  actorRole: string;              // 'support', 'sorcerer', 'observer'
  actorRank?: string;             // Sorcerer rank if applicable
  actorName?: string;             // Parsed from token
  summary: string;                // JSON payload snapshot
};
```

### Natural Language Formatter

**Location**: `src/utils/auditFormat.ts`

Generates human-readable Spanish sentences:

```typescript
formatAuditLine(entry: AuditEntry): string
```

**Examples:**
- `"Se creó un hechicero llamado Yuji Itadori"`
- `"Se actualizó la maldición Rot Curse"`
- `"Se eliminó la misión que atendía Finger Bearer"`
- `"Se creó una misión que atiende Rot Curse"`

**Regex-based extraction** from `summary` JSON for entity names:
- Sorcerer: `/\\"name\\":\\s*\\"([^"]+)\\"/`
- Curse: `/\\"nombre\\":\\s*\\"([^"]+)\\"/`
- Mission curse reference: `/\\"curseIds\\":[^\\[]*\\[(\\d+)/`

### UI Integration

**AuditList Component** (`src/components/AuditList.tsx`)
- Displays recent actions with infinite pagination
- Shows actor info (name, role, rank) and timestamp
- "Ver más" button (visible only when `hasNextPage`)
- Auto-refresh every 10 seconds
- ARIA live region for accessibility

**Usage:**
```tsx
<AuditList limit={20} />
```

### API Endpoints

```
GET /audit?limit=50&cursor=100
```

**Response:**
```json
{
  "items": [
    {
      "id": 100,
      "timestamp": "2025-11-09T12:34:56Z",
      "entity": "sorcerer",
      "action": "create",
      "entityId": 5,
      "actorRole": "support",
      "actorName": "admin",
      "summary": "{\"name\":\"Yuji Itadori\",...}"
    },
    ...
  ],
  "nextCursor": 50,
  "hasMore": true
}
```

### Backend Recommendations

For production, implement:
1. **Persistent storage** (e.g., database table for audit logs)
2. **Indexing** on `timestamp` and `entity` for fast queries
3. **Filtering** by date range, entity type, actor
4. **Retention policies** for log archival
5. **Security**: Ensure only authorized users can read audit logs

## ✨ Key Features

### 1. Infinite Pagination with Backend Support
- **Server-side cursor-based pagination** for sorcerers, curses, missions, and audit logs
- **Normalized API adapter** (`pagedApi`) supports multiple response shapes with graceful fallback
- **Infinite scrolling** via React Query's `useInfiniteQuery` with "Load More" button
- **Automatic cache management** with proper invalidation on mutations
- MSW handlers simulate real pagination behavior (limit + cursor params)

### 2. Comprehensive Audit Logging
- **Automatic tracking** of all CRUD operations on entities
- **Natural language formatting** in Spanish (e.g., "Se creó una misión que atiende Rot Curse")
- **Actor information** including role, rank, and parsed username from token
- **Inline display** in entity management pages with infinite pagination
- **Dedicated audit view** at `/recent-actions` with polling for real-time updates
- **i18n support** with centralized translation dictionary

### 3. Type-Safe Data Fetching
- All API responses strongly typed with TypeScript
- React Query hooks provide loading/error states
- Automatic cache invalidation after mutations (both base and infinite queries)
- Normalized paged responses via `PagedResponse<T>` type

### 4. Form Validation with Conditional Rules
- React Hook Form for performance
- Zod schemas for runtime validation with conditional logic
- Type inference from schemas to forms
- **Mission-specific validation**:
  - `urgency` field required only for pending missions
  - `events` and `collateralDamage` required only for completed missions (success, failure, canceled)
  - Form UI conditionally shows/hides fields based on mission state

### 5. Multi-Select Entity Assignment
- **Reusable `MultiSelect` component** with dark theme styling
- **Dropdown with checkboxes** for assigning sorcerers and curses to missions
- **Search/filter** capability for large lists
- **Selected items display** as chips with overflow counter
- Dynamic option lists from API with proper loading states
- Form values automatically handled as arrays of IDs via React Hook Form `Controller`

### 6. Permission System
- **Centralized permission logic** in `utils/permissions.ts`
- **UI-level enforcement**: Components conditionally render based on `canMutate(user)`
- **Server-side enforcement**: MSW and real backend return 403 for unauthorized operations
- **Role-based access**:
  - Support: Full CRUD access
  - High-rank sorcerers (alto, especial): Full CRUD access
  - Low-rank sorcerers & observers: Read-only access

### 7. Spanish UI with English Internals
- All user-facing labels, buttons, and messages in Spanish
- Internal enums, code, and documentation remain in English
- Mapping dictionaries (`estadoLabel`, `urgenciaLabel`) for display translation
- Validation error messages shown in Spanish

### 8. Error Handling & User Feedback
- Axios interceptors catch 401/403 responses
- Toast notifications (Sonner) for user feedback with Spanish messages
- Graceful degradation for network errors
- Loading skeletons for better perceived performance

### 9. Theming & UI Polish
- Custom Tailwind configuration with JJK-inspired palette
- Custom fonts: Cinzel (headings), Inter (body), Noto Serif JP (accents)
- Mystical shadows and cohesive color scheme
- Responsive design with mobile-first considerations
- Semantic HTML and ARIA attributes for accessibility

### 10. Developer Experience
- Hot Module Replacement (HMR) with Vite
- ESLint + TypeScript for code quality
- Comprehensive TSDoc documentation (in English)
- MSW for API-independent development with realistic backend simulation
- Modular architecture with clear separation of concerns

## � Scripts

```powershell
npm run dev          # Start development server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run typecheck    # Run TypeScript compiler check
npm run lint         # Run ESLint
npm run test         # Run tests with Vitest
```

## 🎯 Mission Management Details

### Conditional Field Rules

The mission form implements business logic to ensure data consistency:

#### Pending Missions (`estado: 'Pendiente'`)
- **Required**: `urgency` (Urgencia) - Must specify priority level
- **Hidden**: `events`, `collateralDamage` - Cannot be filled until mission completes
- **Validation**: Zod schema enforces `urgency` field presence

#### In Progress Missions (`estado: 'En progreso'`)
- **Optional**: All detail fields
- Users can update as mission progresses
- No special validation requirements

#### Completed Missions (`estado: 'Completada con éxito' | 'Completada con fracaso' | 'Cancelada'`)
- **Required**: `events` (Eventos) - Must document what happened
- **Required**: `collateralDamage` (Daños colaterales) - Must record any damage
- **Hidden**: `urgency` - No longer relevant after completion
- **Validation**: Zod schema enforces both fields are non-empty strings

### Server-side Validation (MSW)

Mission rules are enforced both client-side (Zod schema) and server-side (MSW):

1. `urgency` is required when `state === 'pending'`
2. `events` and `collateralDamage` are required (non-empty) when `state` is `'success' | 'failure' | 'canceled'`
3. Pending missions normalize `events`/`collateralDamage` to empty strings

**Invalid requests return `400 Bad Request`:**
```json
{
  "message": "La urgencia es obligatoria para misiones pendientes"
}
```

### Multi-Select Implementation

**Component**: `src/components/ui/MultiSelect.tsx`

**Features:**
- Dark-themed dropdown with checkboxes
- Search/filter input for large lists
- Selected items displayed as chips
- Overflow counter (e.g., "+3 more")
- Loading and error states
- Keyboard navigation support

**Usage in MissionsPage:**

```tsx
// Sorcerers assignment
<Controller
  name="sorcererIds"
  control={control}
  render={({ field }) => (
    <MultiSelect
      label="Hechiceros asignados"
      options={sorcererOptions}
      value={field.value ?? []}
      onChange={field.onChange}
      disabled={sorcerersQ.isLoading}
      placeholder="Seleccionar..."
    />
  )}
/>

// Curses association
<Controller
  name="curseIds"
  control={control}
  render={({ field }) => (
    <MultiSelect
      label="Maldiciones asociadas"
      options={curseOptions}
      value={field.value ?? []}
      onChange={field.onChange}
      disabled={cursesQ.isLoading}
      placeholder="Seleccionar..."
    />
  )}
/>
```

**Option Format:**
```typescript
type Option = {
  value: number;
  label: string;  // e.g., "Yuji Itadori · medio"
};
```

### Validation Messages

All validation messages are in Spanish and user-friendly:
- `"La urgencia es obligatoria en misiones pendientes."`
- `"Debe detallar los eventos para misiones finalizadas."`
- `"Debe indicar los daños colaterales para misiones finalizadas."`
- `"El ID debe ser mayor o igual a 0"`

## 📚 Additional Documentation

- **Mobile Adaptation Guide**: `doc/mobile_steps.md`
- **Vite + React Project Structure**: `doc/vite_react_project_structure.md`

## 🛠️ Troubleshooting

### MSW Not Intercepting Requests
- Verify `VITE_USE_MOCK=true` in `.env.local`
- Check browser console for MSW worker registration message
- Ensure service worker is registered (DevTools → Application → Service Workers)
- Clear browser cache and hard reload (`Ctrl+Shift+R`)

### 403 Forbidden Errors
- Verify user role/rank in DevTools → Application → Local Storage
- Check `Authorization` header in Network tab (should be `Bearer MOCK_TOKEN:role`)
- Review `src/api/mock/handlers.ts` for permission logic
- Ensure logged-in user has appropriate role (support or high-rank sorcerer for mutations)

### Pagination Not Working
- Check Network tab for `limit` and `cursor` query parameters
- Verify backend returns `{ items, nextCursor, hasMore }` or compatible shape
- Review `pagedApi.normalizePaged()` for response shape compatibility
- Check console for React Query errors or warnings

### "Ver más" Button Not Appearing
- Ensure `hasNextPage` is truthy in component
- Verify `getNextPageParam` returns valid cursor (not `undefined` too early)
- Check that `nextCursor` is properly set in API response
- Review infinite hook implementation in `src/hooks/useInfinite*.ts`

### Type Errors
- Run `npm run typecheck` to identify issues
- Ensure all types in `src/types/` match backend contracts
- Check `tsconfig.json` for correct `paths` configuration
- Verify `PagedResponse<T>` is imported where needed

### Audit Log Not Updating
- Verify polling is enabled (default 10s interval)
- Check Network tab for `/audit` requests
- Review MSW handlers for audit entry creation logic
- Ensure mutations trigger `logAuditEntry()` in MSW handlers

### Cache Stale After Mutations
- Verify invalidation predicate in mutation hooks
- Check that query keys match pattern: `['entity', ...]`
- Review React Query DevTools for cache state
- Ensure `qc.invalidateQueries()` uses correct predicate

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
- Add comprehensive TSDoc comments (in English) for exported functions/types/components
- Run `npm run lint` before committing
- Ensure `npm run typecheck` passes

### Adding New Features

#### 1. Define Types (`src/types/`)
```typescript
export type NewEntity = {
  id: number;
  name: string;
  // ... other fields
};
```

#### 2. Create API Client (`src/api/`)
```typescript
export const newEntityApi = {
  async list(params?: { limit?: number; cursor?: number | string }) {
    const qp = [];
    if (params?.limit) qp.push(`limit=${params.limit}`);
    if (params?.cursor) qp.push(`cursor=${params.cursor}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/new-entities${qs}`);
    return normalizePaged<NewEntity>(data, { limit: params?.limit });
  },
  // ... other CRUD methods
};
```

#### 3. Add MSW Handlers (`src/api/mock/handlers.ts`)
```typescript
http.get('/new-entities', ({ request }) => {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit')) || 20;
  const cursor = Number(url.searchParams.get('cursor')) || Infinity;
  
  const items = mockData.newEntities.filter(e => e.id < cursor);
  const page = items.slice(0, limit);
  const nextCursor = page.length === limit ? page[page.length - 1].id : null;
  
  return HttpResponse.json({ items: page, nextCursor, hasMore: !!nextCursor });
}),
```

#### 4. Create Hooks (`src/hooks/`)
```typescript
// Base hook with mutations
export const useNewEntities = () => {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['newEntities'], queryFn: () => newEntityApi.list() });
  const create = useMutation({
    mutationFn: (payload) => newEntityApi.create(payload),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'newEntities',
      }),
  });
  // ... update, remove
  return { list, create, update, remove };
};

// Infinite pagination hook
export const useInfiniteNewEntities = (options?: { pageSize?: number }) => {
  const pageSize = options?.pageSize ?? 20;
  return useInfiniteQuery<PagedResponse<NewEntity>>({
    queryKey: ['newEntities', 'infinite', pageSize],
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam ?? undefined;
      return newEntityApi.list({ limit: pageSize, cursor });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
  });
};
```

#### 5. Build UI (`src/pages/`)
```tsx
export const NewEntitiesPage = () => {
  const { data, hasNextPage, fetchNextPage } = useInfiniteNewEntities({ pageSize: 20 });
  const { create, update, remove } = useNewEntities();
  const items = data?.pages.flatMap((p) => p.items) ?? [];
  
  // ... render table, forms, load more button
};
```

#### 6. Update Documentation
- Add TSDoc to new functions/components
- Update this README if adding major features
- Document permission requirements if applicable

### Testing Checklist
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] MSW handlers work in development
- [ ] Pagination works (load more, cursor continuity)
- [ ] Permissions enforced (UI + MSW)
- [ ] Cache invalidation works after mutations
- [ ] Audit logging works (if applicable)
- [ ] Spanish UI labels used consistently
- [ ] Error handling with toasts
- [ ] Loading states with skeletons

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Academic Institution**: University of Havana  
**Courses**: Software Engineering & Database Management II