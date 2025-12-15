# Scripts de Población de Base de Datos

## Archivos Creados

### 1. DatabaseSeeder.cs (`backend/Data/Seed/DatabaseSeeder.cs`)
Seeder completo que pobla la base de datos con datos del universo de Jujutsu Kaisen:

**Datos creados:**
- **7 Usuarios**: admin, Gojo, Itadori, Fushiguro, Kugisaki, Observador, Soporte
- **10 Ubicaciones**: Tokyo Jujutsu High School, Shibuya, Kyoto, etc.
- **12 Técnicas Malditas**: Limitless, Ten Shadows, Black Flash, Cursed Speech, etc.
- **12 Hechiceros**: Satoru Gojo, Yuji Itadori, Megumi Fushiguro, Nobara Kugisaki, etc.
- **10 Maldiciones**: Ryomen Sukuna, Mahito, Jogo, Hanami, Dagon, etc.
- **5 Personal de Apoyo**: Kiyotaka Ijichi, Akari Nitta, Shoko Ieiri, etc.
- **10 Recursos**: Katanas, clavos malditos, vehículos, kits médicos, detectores, etc.
- **8 Misiones**: Incidente de Shibuya, operaciones en hospitales, zonas industriales, etc.
- **Relaciones**: Técnicas dominadas, hechiceros en misiones, uso de recursos, subordinaciones

### 2. seed-database.ps1 (`backend/seed-database.ps1`)
Script PowerShell para poblar base de datos existente sin eliminar datos previos.

**Funciones:**
- Construye el proyecto
- Aplica migraciones pendientes
- Ejecuta el seeder (si no hay datos existentes, los crea)
- Muestra credenciales de usuarios creados

### 3. reset-database.ps1 (`backend/reset-database.ps1`)
Script PowerShell para resetear completamente la base de datos desde cero.

**Funciones:**
- Solicita confirmación (escribir "SI")
- Elimina la base de datos existente
- Recrea la base de datos con migraciones
- Pobla con datos iniciales
- Muestra resumen de datos creados

### 4. Program.cs (modificado)
Agregada lógica para ejecutar el seeder con argumento `--seed`.

## Uso

### Opción 1: Poblar sin eliminar datos existentes
```powershell
cd backend
.\seed-database.ps1
```

### Opción 2: Reset completo (ELIMINA TODOS LOS DATOS)
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

## Usuarios Creados

Todos los usuarios tienen contraseñas seguras con BCrypt:

| Email | Contraseña | Rol | Rango |
|-------|------------|-----|-------|
| admin@jujutsu.com | admin123 | admin | - |
| gojo@jujutsu.com | gojo123 | hechicero | especial |
| itadori@jujutsu.com | itadori123 | hechicero | estudiante |
| fushiguro@jujutsu.com | megumi123 | hechicero | medio |
| kugisaki@jujutsu.com | nobara123 | hechicero | aprendiz |
| observer@jujutsu.com | observer123 | observador | - |
| support@jujutsu.com | support123 | support | - |

## Características del Seeder

✅ **Verificación de datos existentes**: No duplica datos si ya existen hechiceros
✅ **Relaciones completas**: Crea todas las relaciones entre entidades
✅ **Datos realistas**: Basados en el universo de Jujutsu Kaisen
✅ **Enums correctos**: Usa los valores exactos definidos en los modelos
✅ **Fechas coherentes**: Misiones y eventos con fechas lógicas
✅ **Salida informativa**: Muestra progreso en consola

## Notas

- Los **traslados** fueron omitidos porque requieren objetos Ubicacion completos (no solo IDs)
- Las contraseñas están hasheadas con BCrypt para seguridad
- El seeder valida que no existan datos antes de crear nuevos
- Compatible con migraciones existentes de Entity Framework

## Troubleshooting

**Error: "La base de datos ya contiene datos"**
- Solución: Usar `reset-database.ps1` para limpiar primero

**Error de migraciones**
- Solución: `dotnet ef database update --project backend`

**Error de build**
- Solución: Verificar que todas las dependencias estén instaladas con `dotnet restore`
