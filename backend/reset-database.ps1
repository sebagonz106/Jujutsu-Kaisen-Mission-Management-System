# Script para limpiar y repoblar la base de datos desde cero
# ADVERTENCIA: Este script eliminará TODOS los datos existentes
# Uso: .\reset-database.ps1

Write-Host "==================================================" -ForegroundColor Red
Write-Host "  ADVERTENCIA: RESET DE BASE DE DATOS" -ForegroundColor Red
Write-Host "==================================================" -ForegroundColor Red
Write-Host ""
Write-Host "Este script eliminará TODOS los datos de la base de datos" -ForegroundColor Yellow
Write-Host "y la poblará nuevamente con datos de prueba." -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "¿Está seguro que desea continuar? (escriba 'SI' para confirmar)"
if ($confirmation -ne "SI") {
    Write-Host "Operación cancelada" -ForegroundColor Yellow
    exit 0
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "GestionDeMisiones.csproj")) {
    Write-Host "Error: Debe ejecutar este script desde el directorio backend/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Paso 1: Construyendo el proyecto..." -ForegroundColor Yellow
dotnet build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al construir el proyecto" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Proyecto construido exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 2: Eliminando base de datos existente..." -ForegroundColor Yellow
dotnet ef database drop --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al eliminar la base de datos" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Base de datos eliminada" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 3: Recreando base de datos con migraciones..." -ForegroundColor Yellow
dotnet ef database update
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al aplicar migraciones" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Base de datos recreada exitosamente" -ForegroundColor Green
Write-Host ""

Write-Host "Paso 4: Poblando la base de datos..." -ForegroundColor Yellow
dotnet run --no-build -- --seed

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "  ✓ Base de datos reset y poblada exitosamente!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "La base de datos ha sido completamente reiniciada." -ForegroundColor Cyan
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
    Write-Host "Datos poblados:" -ForegroundColor Cyan
    Write-Host "  • 7 Usuarios" -ForegroundColor White
    Write-Host "  • 10 Ubicaciones" -ForegroundColor White
    Write-Host "  • 12 Técnicas Malditas" -ForegroundColor White
    Write-Host "  • 12 Hechiceros" -ForegroundColor White
    Write-Host "  • 10 Maldiciones" -ForegroundColor White
    Write-Host "  • 5 Personal de Apoyo" -ForegroundColor White
    Write-Host "  • 10 Recursos" -ForegroundColor White
    Write-Host "  • 8 Misiones" -ForegroundColor White
    Write-Host "  • Y relaciones asociadas..." -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Error al poblar la base de datos" -ForegroundColor Red
    exit 1
}
