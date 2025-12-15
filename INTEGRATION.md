# Integración Frontend - Backend (GestionDeMisiones)

## Resumen
Backend ASP.NET Core (net9.0) expone API versionada en `/api/v1`. Frontend (React + Vite) consume endpoints en inglés y una capa de traducción de rutas convierte a controladores en español. Autenticación JWT implementada con usuarios persistentes (`Usuarios`) y roles normalizados en el token.

## Puertos y URLs
- Backend dev (HTTP): `http://localhost:5189`
- Backend base API: `http://localhost:5189/api/v1`
- Frontend dev (Vite): `http://localhost:5173`

## CORS
Configurado para permitir orígenes: `http://localhost:5173-5175` (HTTP y HTTPS), con credenciales, métodos y headers libres.

## Versionado API
Convención global añade `/api/v1` a todas las rutas. Controladores con `[Route("api/[controller]")]` exponen finalmente `/api/v1/<ControllerName>`.

## Traducción de Rutas (Frontend -> Backend)
El cliente Axios (`src/api/client.ts`) mapea:
| Frontend | Backend |
|----------|---------|
| /missions | /Mision |
| /sorcerers | /Hechicero |
| /curses | /Maldicion |
| /resources | /Recurso |
| /support-staff | /PersonalDeApoyo |
| /locations | /Ubicacion |
| /transfers | /Traslado |
| /techniques | /TecnicaMaldita |
| /applied-techniques | /TecnicaMalditaAplicada |
| /dominated-techniques | /TecnicaMalditaDominada |
| /requests | /Solicitud |
| /audit | /Audit (si existe) |

## Autenticación
- Endpoints: `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/me`, `/api/v1/auth/create` (admin/support).
- Token JWT en Authorization: `Bearer <token>`.
- Roles en DB (español): `observador`, `support`, `hechicero`, `admin`.
- Roles emitidos en token (inglés/spanish mapping): `observer`, `support`, `sorcerer`, `admin`.
  - Nota: la implementación actual emite `admin` como rol en el token. Si el frontend no acepta `admin` en sus tipos, ajuste su union o cambie la normalización en `AuthService` (mapeo previo: admin -> support).
- Rank (rango) se expone como `rank` si existe (aplicable a hechiceros y otros roles si se asigna).

## Paginación
Controladores clave soportan `?limit=&cursor=`:
1. Misiones (`/api/v1/Mision`)
2. Hechiceros (`/api/v1/Hechicero`)
3. Maldiciones (`/api/v1/Maldicion`)

Respuesta paginada:
```json
{
  "items": [ ... ],
  "nextCursor": 42,
  "hasMore": true
}
```
- `cursor`: último Id consumido; nuevo lote empieza con Id > cursor.
- `limit`: máximo de items (default 20, max 100).
- Si no se pasan `limit`/`cursor`, se devuelve lista completa.

## Variables de Entorno Frontend
`.env.local`:
```
VITE_API_URL=http://localhost:5189/api/v1
VITE_USE_MOCK=false
```

## Crear Usuarios
1. Registro estándar (rol inicial `observador`):
```bash
POST /api/v1/auth/register
{ "name":"User", "email":"user@example.com", "password":"pass123" }
```
2. Actualizar rol/rango (temporal) vía SQL:
```sql
UPDATE Usuarios SET Rol='hechicero', Rango='alto' WHERE Email='user@example.com';
```
3. Herramienta consola:
```powershell
dotnet run --project Backend/Tools/CreateUserTool -- "Satoru" "gojo@example.com" "safePass" "hechicero" "especial"
```
4. Endpoint admin para crear usuarios con rol y rango (implementado):

```
POST /api/v1/auth/create
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Satoru Gojo",
  "email": "gojo@example.com",
  "password": "safePass",
  "role": "hechicero", // acepta: observador|observer, hechicero|sorcerer, support, admin
  "rank": "especial"
}
```

Respuesta:

```json
{
  "user": {
    "id": 123,
    "name": "Satoru Gojo",
    "email": "gojo@example.com",
    "role": "sorcerer", // role emitido en token/response (normalized)
    "rank": "especial"
  }
}
```

## Migraciones Pendientes
Generar migración para tabla `Usuarios` y columna `Rango` si aún no existe:
```powershell
dotnet ef migrations add AddUsuarioAndRango --project Backend/GestionDeMisiones.csproj --startup-project Backend/GestionDeMisiones.csproj
dotnet ef database update --project Backend/GestionDeMisiones.csproj --startup-project Backend/GestionDeMisiones.csproj
```

## Seguridad y Secretos
- Clave JWT actual en `appsettings.json` (solo desarrollo). Mover a User Secrets:
```powershell
dotnet user-secrets init --project Backend/GestionDeMisiones.csproj
dotnet user-secrets set "Jwt:Key" "PROD-SECRET-GENERATE-LONG-RANDOM" --project Backend/GestionDeMisiones.csproj
```
- Para producción: usar variable de entorno o vault.

## Poblar Base de Datos

### Opción 1: Poblar base de datos existente (no elimina datos)
```powershell
cd backend
.\seed-database.ps1
```

### Opción 2: Resetear y repoblar desde cero (ELIMINA TODOS LOS DATOS)
```powershell
cd backend
.\reset-database.ps1
```

### Opción 3: Comando manual
```powershell
cd backend
dotnet build
dotnet ef database update
dotnet run -- --seed
```

El seeder crea automáticamente:
- 7 Usuarios (admin, hechiceros, observador, soporte)
- 10 Ubicaciones (Tokyo, Shibuya, Kyoto, etc.)
- 12 Técnicas Malditas (Limitless, Ten Shadows, Black Flash, etc.)
- 12 Hechiceros (Gojo, Yuji, Megumi, Nobara, etc.)
- 10 Maldiciones (Sukuna, Mahito, Jogo, etc.)
- 5 Personal de Apoyo
- 10 Recursos (armas, vehículos, herramientas)
- 8 Misiones (completadas, en progreso, pendientes)
- Relaciones: técnicas dominadas, hechiceros en misión, traslados, uso de recursos, subordinaciones

## Comandos de Ejecución
Backend:
```powershell
cd backend
dotnet build
dotnet run
```
Frontend:
```powershell
cd mission_management
npm install
npm run dev
```

## Troubleshooting
| Problema | Causa | Solución |
|----------|-------|----------|
| CORS bloqueado | Origen no permitido | Verificar política `FrontendPolicy` en `Program.cs` |
| 401 en /auth/me | Token ausente o expirado | Relogin y enviar Authorization Bearer |
| 500 al registrar | Migración `Usuarios` ausente | Ejecutar migraciones EF |
| Paginación no devuelve `hasMore` correcto | Límite muy alto | Usar límite <= 100 |
| Rol inesperado | Normalización interna | Ver `NormalizeRoleForToken` en `AuthService` |

## Próximas Mejoras (sugerencias)
- Refresh tokens / expiraciones cortas.
- Auditoría (tabla de eventos: login, register, cambios de rol).
- Tests automáticos de paginación y auth.
- Eliminar capa de traducción una vez que los controladores estén renombrados a inglés.

---
Última actualización: Fecha generación del archivo.
