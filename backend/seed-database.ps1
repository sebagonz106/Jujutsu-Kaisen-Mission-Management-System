# Script para poblar la base de datos con datos de prueba
# Uso: .\seed-database.ps1

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Jujutsu Kaisen Mission Management System" -ForegroundColor Cyan
Write-Host "  Database Seeder" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "GestionDeMisiones.csproj")) {
    Write-Host "Error: Debe ejecutar este script desde el directorio backend/" -ForegroundColor Red
    exit 1
}

Write-Host "Paso 1: Construyendo el proyecto..." -ForegroundColor Yellow
dotnet build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al construir el proyecto" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Proyecto construido exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 2: Ejecutando migraciones..." -ForegroundColor Yellow
dotnet ef database update
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al aplicar migraciones" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Migraciones aplicadas exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 3: Poblando la base de datos..." -ForegroundColor Yellow
Write-Host "ADVERTENCIA: Si ya existen datos, el seeding será omitido." -ForegroundColor Yellow
Write-Host ""
dotnet run --no-build -- --seed

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "  ✓ Base de datos poblada exitosamente!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usuarios creados:" -ForegroundColor Cyan
    Write-Host "  • Admin: admin@jujutsu.com / admin123" -ForegroundColor White
    Write-Host "  • Gojo: gojo@jujutsu.com / gojo123" -ForegroundColor White
    Write-Host "  • Itadori: itadori@jujutsu.com / itadori123" -ForegroundColor White
    Write-Host "  • Fushiguro: fushiguro@jujutsu.com / megumi123" -ForegroundColor White
    Write-Host "  • Kugisaki: kugisaki@jujutsu.com / nobara123" -ForegroundColor White
    Write-Host "  • Observador: observer@jujutsu.com / observer123" -ForegroundColor White
    Write-Host "  • Soporte: support@jujutsu.com / support123" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Error al poblar la base de datos" -ForegroundColor Red
    exit 1
}
