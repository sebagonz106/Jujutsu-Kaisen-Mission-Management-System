## Adaptación móvil (sidebar a topbar + drawer)

### Objetivo
Convertir la experiencia de escritorio con sidebar fija en una interfaz móvil optimizada: topbar compacto con botón hamburguesa que abre un drawer lateral, manteniendo la identidad visual (kanji 呪術廻戦 y paleta JJK) y accesibilidad.

### Alcance mínimo
1. Breakpoint base: aplicar layout móvil hasta `md` (<768px).  
2. Reemplazar `Layout` sidebar por:
   - Barra superior: izquierda botón menú, centro marca (kanji + título reducido), derecha (opcional) botón logout/avatar.
   - Drawer (off-canvas) que reutiliza navegación y role badge.
3. Listas (Hechiceros, Maldiciones, Misiones) en mobile: usar tarjetas apiladas (grid 1 columna, gap consistente) con acciones en menú contextual (kebab) o botones compactos.
4. Formularios: ancho completo, evitar modales si puede ser página dedicada; si se usa modal, full-screen en mobile (`fixed inset-0`).

### Pasos detallados
1. Crear hook `useIsMobile` (matchMedia o `useWindowSize`) para lógica condicional.
2. Refactor de `Layout`:
   - Extraer contenido del sidebar a componente `NavContent` reutilizable.
   - Implementar `MobileTopbar` y `Drawer`.
3. Añadir estado `isDrawerOpen` (useState) y animación con Tailwind (translate-x, opacity, backdrop blur).
4. Foco y accesibilidad: al abrir drawer, foco inicial en primer link; cerrar con Escape; aria-labels y `role="dialog"`.
5. Scroll locking: aplicar `document.body.style.overflow = 'hidden'` mientras el drawer esté abierto (cleanup al cerrar / unmount).
6. Kanji y título: reducir tamaño (`text-lg` kanji, `text-base` título) para topbar; mantener colores oro/púrpura.
7. Tarjetas en listados: crear componente `EntityCard` que muestre nombre, metadatos clave y acciones. Sustituir tabla condicionalmente en mobile (`isMobile ? cards : table`).
8. Optimizar peso: lazy-load páginas (dynamic import con React.lazy) si el bundle crece; defer fuentes en mobile si LCP alto (ver Lighthouse).
9. Testing iterativo: usar DevTools responsive + Lighthouse + interacción de teclado (Tab, Enter, Escape).
10. Dark mode: ya presente; confirmar contraste AA para texto secundario en tarjetas (usar `text-jjk-fog`).

### Drawer CSS (borrador)
```
.drawer-enter { transform: translateX(-100%); opacity: 0; }
.drawer-enter-active { transform: translateX(0); opacity: 1; transition: transform .25s ease-out, opacity .25s; }
.drawer-exit { transform: translateX(0); opacity: 1; }
.drawer-exit-active { transform: translateX(-100%); opacity: 0; transition: transform .2s ease-in, opacity .2s; }
```
En Tailwind se puede lograr con clases utilitarias y estado condicional sin CSS adicional.

### Estructura recomendada
```
Layout
  if mobile
    <MobileTopbar />
    {isDrawerOpen && <Drawer onClose=...><NavContent /></Drawer>}
  else
    <Sidebar><NavContent /></Sidebar>
  <main>{children}</main>
```

### Edge cases
- Resize mientras drawer abierto: cerrar automáticamente si pasa a desktop.
- Navegación interna que cambia ruta: cerrar drawer.
- Foco atrapado: asegurar ciclo (Shift+Tab en primer elemento regresa al último).
- Teclado virtual (mobile): topbar fijo no debe tapar campos (usar `safe-area-inset-top`).

### Métricas y validación
- Lighthouse: mantener LCP <2.5s en dispositivos móviles medianos.
- Bundle split: verificar `dist` chunk principal < ~200KB gzip (ajustar lazy-loading si excede).
- Focus order correcto (tabbing) en drawer.
- Gestos: opcional swipe para abrir/cerrar (agregar después si necesario).

### Próximos pasos (futuros)
- Persistencia de preferencia (si usuario oculta drawer rápido).
- Animación framer-motion para suavizar transiciones.
- Modo compacto adicional en landscape (reducir altura topbar).

### Checklist rápido
- [ ] Hook isMobile
- [ ] Extraer NavContent
- [ ] Topbar + Drawer
- [ ] EntityCard
- [ ] Condicional tabla vs tarjetas
- [ ] Accesibilidad + foco
- [ ] Resize handling
- [ ] Validación Lighthouse

---
Esta guía sirve como referencia para implementar la experiencia móvil manteniendo la estética de Jujutsu Kaisen.