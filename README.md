# Jujutsu Kaisen Mission Management System

<div align="center">

![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?style=flat&logo=dotnet)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC2927?style=flat&logo=microsoftsqlserver)
![License](https://img.shields.io/badge/License-Academic-green)

A full-stack web application for managing sorcerer missions, curses, and personnel in the **Jujutsu Kaisen** universe. Built as an academic project demonstrating modern software engineering practices with ASP.NET Core 9 backend and React 19 frontend.

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Frontend-Backend Integration](#frontend-backend-integration)
- [Security & Authentication](#security--authentication)
- [PDF Export](#pdf-export)
- [Internationalization](#internationalization)
- [Documentation](#documentation)

---

## 🌟 Overview

The **Jujutsu Kaisen Mission Management System** is a comprehensive platform designed to manage the operational aspects of jujutsu sorcery organizations. It handles:

- **Sorcerer Management**: Track sorcerers, their grades, techniques, and mission history
- **Mission Coordination**: Create, assign, and monitor exorcism missions
- **Curse Database**: Catalog and classify cursed spirits by threat level and state
- **Resource Allocation**: Manage equipment, supplies, and support personnel
- **Analytics & Reporting**: Generate statistical reports and PDF exports

This project demonstrates enterprise-level patterns including Clean Architecture, Repository Pattern, JWT authentication, role-based access control (RBAC), and modern React practices.

---

## ✨ Features

### Core Functionality
- **CRUD Operations** for all domain entities (Sorcerers, Curses, Missions, Techniques, etc.)
- **Infinite Scroll Pagination** with TanStack Query for seamless data loading
- **Real-time Search & Filtering** across all entity lists
- **Sortable Tables** with ascending/descending toggle

### Advanced Queries
| Query | Description |
|-------|-------------|
| **RF-12** | Curses filtered by state (active, sealed, exorcised) |
| **RF-13** | Missions within a date range |
| **RF-14** | Sorcerer statistics and performance metrics |
| **Query 2** | Missions by specific sorcerer |
| **Query 4** | Technique effectiveness analysis |
| **Query 6** | Master-disciple relationships |
| **Ranking** | Top sorcerers by location and level |

### PDF Export
- Generate professional PDF reports for all queries
- Powered by **QuestPDF** (Community License)
- Downloadable directly from the frontend

### User Experience
- **Dark Theme** with custom Jujutsu Kaisen aesthetic
- **Spanish Localization** with i18n support
- **Toast Notifications** for user feedback
- **Form Validation** with Zod schemas
- **Responsive Design** optimized for desktop

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **ASP.NET Core 9** | Web API framework |
| **Entity Framework Core 9** | ORM and migrations |
| **SQL Server** | Relational database |
| **JWT Bearer** | Authentication tokens |
| **BCrypt.NET** | Password hashing |
| **QuestPDF** | PDF document generation |
| **Swagger/OpenAPI** | API documentation |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool and dev server |
| **TanStack Query v5** | Data fetching and caching |
| **React Hook Form + Zod** | Form handling and validation |
| **Tailwind CSS** | Styling |
| **Axios** | HTTP client |
| **Sonner** | Toast notifications |
| **MSW** | API mocking for development |

---

## 🏗️ Architecture

### Backend Architecture (Clean Architecture)

```
backend/
├── Core/                    # Domain Layer
│   └── Modelos/            # Entity models (Hechicero, Mision, Maldicion, etc.)
├── Aplication/             # Application Layer
│   ├── IServices/          # Service interfaces
│   └── Services/           # Business logic implementations
├── infraestructure/        # Infrastructure Layer
│   ├── IRepository/        # Repository interfaces
│   └── Repositorie/        # Data access implementations
├── Data/                   # Data Layer
│   ├── AppDbContext.cs     # EF Core DbContext
│   └── Seed/               # Database seeding
├── Web/                    # Presentation Layer
│   ├── Controlers/         # API Controllers
│   └── DTOs/               # Data Transfer Objects
└── Migrations/             # EF Core migrations
```

### Frontend Architecture

```
mission_management/src/
├── api/                    # HTTP client and API functions
│   ├── client.ts          # Axios instance with interceptors
│   ├── pagedApi.ts        # Pagination normalization
│   └── [entity]Api.ts     # Entity-specific API calls
├── components/             # Reusable UI components
│   ├── ui/                # Primitives (Button, Modal, Table, etc.)
│   └── Layout.tsx         # Main layout with sidebar
├── context/               # React Context providers
│   └── AuthContext.tsx    # Authentication state
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Auth hook
│   └── useInfinite*.ts    # Infinite query hooks
├── pages/                 # Page components
│   ├── admin/             # Admin pages
│   ├── queries/           # Analytical query pages
│   └── [entity]/          # CRUD pages per entity
├── i18n/                  # Internationalization
│   └── es.ts              # Spanish translations
├── routes/                # Routing configuration
├── schemas/               # Zod validation schemas
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions (permissions, etc.)
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐ │
│  │ Component  │───▶│ React Query  │───▶│ API Client  │───▶│  Axios   │ │
│  │   (UI)     │    │   (Cache)    │    │ (pagedApi)  │    │ (HTTP)   │ │
│  └────────────┘    └──────────────┘    └─────────────┘    └────┬─────┘ │
└────────────────────────────────────────────────────────────────┼───────┘
                                                                 │
                                              HTTP (REST + JSON) │
                                                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                    │
│  ┌────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐ │
│  │ Controller │───▶│   Service    │───▶│ Repository  │───▶│ EF Core  │ │
│  │   (API)    │    │  (Business)  │    │   (Data)    │    │ (ORM)    │ │
│  └────────────┘    └──────────────┘    └─────────────┘    └────┬─────┘ │
└────────────────────────────────────────────────────────────────┼───────┘
                                                                 │
                                                                 ▼
                                                         ┌──────────────┐
                                                         │  SQL Server  │
                                                         │  (Database)  │
                                                         └──────────────┘
```

---

## 📂 Project Structure

```
Jujutsu-Kaisen-Mission-Management-System/
├── backend/                      # ASP.NET Core Web API
│   ├── Aplication/              # Services and interfaces
│   ├── Core/Modelos/            # Domain entities
│   ├── Data/                    # DbContext and seeding
│   ├── infraestructure/         # Repositories
│   ├── Web/Controlers/          # API endpoints
│   ├── Migrations/              # Database migrations
│   └── Program.cs               # Application entry point
│
├── mission_management/           # React Frontend
│   ├── src/                     # Source code
│   ├── public/                  # Static assets
│   ├── package.json             # Dependencies
│   └── vite.config.ts           # Vite configuration
│
├── Documentation/                # Project documentation
│   ├── Technical Report/        # Technical documentation
│   ├── User's Manual/           # User guide (LaTeX)
│   └── Seminario Integrador/    # Academic presentation
│
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **.NET 9 SDK** ([Download](https://dotnet.microsoft.com/download/dotnet/9.0))
- **Node.js 20+** ([Download](https://nodejs.org/))
- **SQL Server** (LocalDB or full instance)
- **Git**

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Restore packages
dotnet restore

# Update connection string in appsettings.json
# "DefaultConnection": "Server=...;Database=JJKMissions;..."

# Apply migrations
dotnet ef database update

# Run the API (default: https://localhost:5001)
dotnet run
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd mission_management

# Install dependencies
npm install

# Start development server (default: http://localhost:5173)
npm run dev
```

### Environment Configuration

**Backend (`appsettings.json`)**:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=JJKMissions;Trusted_Connection=True;"
  },
  "Jwt": {
    "Key": "your-secret-key-min-32-chars",
    "Issuer": "JJKMissionManagement",
    "Audience": "JJKMissionManagement"
  }
}
```

**Frontend** (`.env` optional):
```env
VITE_API_BASE_URL=https://localhost:5001/api/v1
VITE_ENABLE_MSW=false
```

---

## 📡 API Documentation

### Base URL
```
https://localhost:5001/api/v1
```

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | User login, returns JWT |
| `POST` | `/auth/register` | User registration |
| `GET` | `/auth/me` | Get current user info |

### Entity Endpoints (CRUD)
All entity endpoints follow RESTful conventions:

| Entity | Base Path |
|--------|-----------|
| Sorcerers | `/hechiceros` |
| Curses | `/maldiciones` |
| Missions | `/misiones` |
| Techniques | `/tecnicas-malditas` |
| Locations | `/ubicaciones` |
| Resources | `/recursos` |
| Requests | `/solicitudes` |
| Transfers | `/traslados` |
| Support Staff | `/personal-de-apoyo` |

### Query Endpoints
| Endpoint | Description |
|----------|-------------|
| `/curse-queries/{state}` | Curses by state |
| `/mission-range-queries` | Missions in date range |
| `/sorcerer-stats` | Sorcerer statistics |
| `/Query2/{sorcererId}` | Missions by sorcerer |
| `/Query4` | Technique effectiveness |
| `/Query6` | Master-disciple relations |
| `/RankingHechiceros/top-por-nivel` | Sorcerer ranking |

### PDF Export
Each query endpoint has a corresponding PDF export:
```
GET /[query-endpoint]/pdf
```

---

## 🔗 Frontend-Backend Integration

### Route Translation
The frontend uses Spanish-friendly routes that are translated to backend endpoints:

```typescript
// Frontend route → Backend endpoint
'/sorcerers'              → '/hechiceros'
'/curses'                 → '/maldiciones'
'/missions'               → '/misiones'
'/queries/curses-by-state' → '/curse-queries'
'/sorcerer-ranking'       → '/RankingHechiceros/top-por-nivel'
```

### Pagination
The API uses cursor-based pagination with consistent response format:

```json
{
  "items": [...],
  "nextCursor": 5,
  "hasMore": true
}
```

### Error Handling
- **401 Unauthorized**: Token cleared, redirect to login
- **403 Forbidden**: Toast notification shown
- **500 Server Error**: Error boundary catches and displays

---

## 🔐 Security & Authentication

### Authentication Flow
1. User submits credentials to `/auth/login`
2. Backend validates and returns JWT token
3. Token stored in memory and attached to requests via Axios interceptor
4. Token includes user role claim for authorization

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, user management |
| **Support** | Full CRUD on all entities |
| **Sorcerer (High)** | Full CRUD (grades: `alto`, `especial`) |
| **Sorcerer (Low)** | Read-only access |

### Permission Enforcement
- **Frontend**: UI elements conditionally rendered based on role
- **Backend**: Authorization attributes on controllers
- **Database**: Audit trail of all operations

---

## 📄 PDF Export

PDF reports are generated using **QuestPDF** with the Community License.

### Supported Reports
- Curses by State
- Missions in Date Range
- Sorcerer Statistics
- Technique Effectiveness
- Master-Disciple Relationships
- Sorcerer Rankings

### Implementation
- Reports generated server-side and streamed as blob
- Frontend triggers download via temporary URL

---

## 🌐 Internationalization

The application is fully localized in **Spanish** using a custom i18n system.

### Translation Structure
```typescript
// src/i18n/es.ts
export const es = {
  common: { loading: 'Cargando...', error: 'Error al cargar' },
  form: { labels: { name: 'Nombre', grade: 'Grado' } },
  pages: { sorcerers: { title: 'Hechiceros' } },
  toast: { created: 'Creado', updated: 'Actualizado' },
  // ...
};
```

### Usage
```tsx
import { t } from '../i18n';

<h1>{t('pages.sorcerers.title')}</h1>
```

---

## 📚 Documentation

Additional documentation is available in the `/Documentation` folder:

| Document | Description |
|----------|-------------|
| **Technical Report** | System architecture and design decisions |
| **User's Manual** | End-user guide with screenshots |
| **Seminario Integrador** | Academic presentation materials |

---

## 👥 Authors

This project was developed as part of the **Software Engineering** course at the University of Havana.

---

## 📝 License

This project is for **academic purposes only**. The Jujutsu Kaisen trademark and characters are property of Gege Akutami and Shueisha.

---

<div align="center">

**Built with 💀 for the Jujutsu World**

*"With this treasure, I summon..."* - Fushiguro Megumi

</div>
