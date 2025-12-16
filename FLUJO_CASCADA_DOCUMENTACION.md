# 📋 Documentación: Flujo de Cascada Maldición → Solicitud → Hechicero Encargado → Misión

**Última actualización:** Diciembre 2025  
**Estado:** ✅ Completamente implementado y testeado (63/63 tests passing)

---

## 📑 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura de Entidades](#estructura-de-entidades)
3. [Flujo de Estados Completo](#flujo-de-estados-completo)
4. [Transiciones Detalladas](#transiciones-detalladas)
5. [Casos Esquinados](#casos-esquinados)
6. [Ejemplos de Código](#ejemplos-de-código)
7. [Guía para el Frontend](#guía-para-el-frontend)
8. [Endpoints REST](#endpoints-rest)
9. [Respuestas del API](#respuestas-del-api)

---

## 🎯 Visión General

El sistema implementa un flujo de cascada donde **los cambios en una entidad desencadenan automáticamente cambios en otras**. El flujo es **Maldición → Solicitud → Hechicero Encargado → Misión**.

### Principios Clave

1. **No se elimina datos históricos**: Todos los cambios se registran con transiciones de estado
2. **Transiciones automáticas**: Cuando cambia el estado de una entidad, sus entidades relacionadas se actualizan automáticamente
3. **Validaciones de negocio**: Cada transición valida requisitos previos
4. **Manejo de huérfanos**: Las referencias perdidas se crean automáticamente como "desconocidas"

### Relaciones Entre Entidades

```
┌─────────────────────────────────────────────────────────────┐
│                        MALDICION                             │
│ (activa, en_proceso_de_exorcismo, exorcisada)               │
└────────────────────────┬────────────────────────────────────┘
                         │ 1:1
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      SOLICITUD                               │
│ (pendiente, atendiendose, atendida)                         │
└────────────────────────┬────────────────────────────────────┘
                         │ 1:1
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 HECHICERO ENCARGADO                          │
│ (nexo entre Solicitud, Maldición y Misión)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ 1:1
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       MISION                                 │
│ (Pendiente, EnProgreso, CompletadaConExito,                 │
│  CompletadaConFracaso, Cancelada)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Estructura de Entidades

### Maldición (Maldicion.cs)

```csharp
public class Maldicion
{
    public int Id { get; set; }
    public string Nombre { get; set; }
    public DateTime FechaYHoraDeAparicion { get; set; }
    public EGrado Grado { get; set; }           // grado_1, grado_2, ..., especial
    public ETipo Tipo { get; set; }              // maligna, semi_maldicion, residual, desconocida
    public EEstadoActual EstadoActual { get; set; }  // activa, en_proceso_de_exorcismo, exorcisada
    public ENivelPeligro NivelPeligro { get; set; }  // bajo, moderado, alto
    public int UbicacionDeAparicionId { get; set; }
}
```

**Estados Posibles:**
- **activa**: Maldición detectada y sin atender
- **en_proceso_de_exorcismo**: Misión en progreso contra esta maldición
- **exorcisada**: Misión completada con éxito

### Solicitud (Solicitud.cs)

```csharp
public class Solicitud
{
    public int Id { get; set; }
    public int MaldicionId { get; set; }
    public EEstadoSolicitud Estado { get; set; }
}

public enum EEstadoSolicitud
{
    pendiente,        // Aguardando asignación
    atendiendose,     // Asignada a un Hechicero, Misión en progreso
    atendida          // Misión completada
}
```

### Misión (Mision.cs)

```csharp
public class Mision
{
    public int Id { get; set; }
    public DateTime FechaYHoraDeInicio { get; set; }
    public DateTime? FechaYHoraDeFin { get; set; }
    public int UbicacionId { get; set; }
    public EEstadoMision Estado { get; set; }
    public ENivelUrgencia NivelUrgencia { get; set; }
}

public enum EEstadoMision
{
    Pendiente,                // Creada, aguardando inicio
    EnProgreso,               // En ejecución
    CompletadaConExito,       // Finalizada exitosamente
    CompletadaConFracaso,     // Falló - maldición revive
    Cancelada                 // Cancelada - maldición regresa a activa
}
```

### Hechicero Encargado (HechiceroEncargado.cs)

```csharp
public class HechiceroEncargado
{
    public int Id { get; set; }
    public int HechiceroId { get; set; }       // El Hechicero asignado
    public int SolicitudId { get; set; }       // La Solicitud que atiende
    public int MisionId { get; set; }          // La Misión asignada
}
```

---

## 🔄 Flujo de Estados Completo

### Ciclo Completo Normal (Éxito)

```
MALDICION: activa
    ↓
    └──> SOLICITUD: pendiente
         ↓
         └──> SOLICITUD UPDATE: pendiente → atendiendose
              ├─ MISION: creada (Pendiente)
              ├─ HECHICERO ENCARGADO: creado
              ├─ MALDICION: → en_proceso_de_exorcismo
              ↓
              └──> MISION UPDATE: Pendiente → EnProgreso
                   ├─ HECHICERO EN MISION: creado
                   ├─ SOLICITUD: → atendida
                   ├─ MALDICION: en_proceso_de_exorcismo ✓
                   ↓
                   └──> MISION UPDATE: EnProgreso → CompletadaConExito
                        ├─ MALDICION: → exorcisada ✓ FIN
                        ├─ SOLICITUD: → atendida
                        └─ FIN: Maldición derrotada
```

### Ciclo con Fracaso (Reintentos)

```
MALDICION: activa
    ↓
    └──> SOLICITUD: pendiente
         ↓
         └──> SOLICITUD UPDATE: pendiente → atendiendose
              ├─ MISION: creada (Pendiente)
              ├─ HECHICERO ENCARGADO: creado
              ├─ MALDICION: → en_proceso_de_exorcismo
              ↓
              └──> MISION UPDATE: Pendiente → EnProgreso
                   ├─ MALDICION: en_proceso_de_exorcismo ✓
                   ↓
                   └──> MISION UPDATE: EnProgreso → CompletadaConFracaso
                        ├─ MALDICION: → activa (revive)
                        ├─ SOLICITUD: → pendiente (reinicia)
                        ↓ REINTENTAR: SOLICITUD → atendiendose de nuevo
```

---

## 🔀 Transiciones Detalladas

### 1️⃣ Creación de Maldición (MaldicionService.CreateAsync)

**Acción:** Se crea una nueva Maldición  
**Cambios en Cascada:**
- ✅ Se crea automáticamente una **Solicitud** en estado `pendiente`

```csharp
POST /api/maldicion
{
  "nombre": "Maldición del Hospital",
  "grado": "semi_especial",
  "tipo": "residual",
  "nivelPeligro": "moderado"
}

RESPUESTA 200:
{
  "success": true,
  "message": "Maldición creada. Solicitud generada automáticamente.",
  "generatedData": {
    "maldicionId": 15,
    "solicitudId": 42
  }
}
```

**Estado Final:**
| Entidad | Estado |
|---------|--------|
| Maldición | creada (estado: `activa`) |
| Solicitud | creada (`pendiente`) |
| Misión | no existe |
| HechiceroEncargado | no existe |

---

### 2️⃣ Transición: Solicitud `pendiente` → `atendiendose`

**Endpoint:** `PUT /api/solicitud/{id}`

**Requisitos:**
- `HechiceroEncargadoId` (requerido): ID del Hechicero que atenderá
- `NivelUrgencia` (requerido): Nivel de urgencia de la misión
- El Hechicero debe existir

**Cambios en Cascada:**
- ✅ Se crea una nueva **Misión** en estado `Pendiente`
- ✅ Se crea un **HechiceroEncargado** vinculando Solicitud + Misión + Hechicero
- ✅ La **Maldición** pasa a estado `en_proceso_de_exorcismo`

```csharp
PUT /api/solicitud/42
{
  "estado": "atendiendose",
  "hechiceroEncargadoId": 5,
  "nivelUrgencia": "EmergenciaCritica"
}

RESPUESTA 200:
{
  "success": true,
  "message": "Solicitud actualizada. Misión y HechiceroEncargado generados automáticamente.",
  "generatedData": {
    "misionId": 28,
    "hechiceroEncargadoId": 12
  }
}
```

**Estado Final:**
| Entidad | Estado | Cambios |
|---------|--------|---------|
| Solicitud | `atendiendose` | ✅ Actualizada |
| Misión | `Pendiente` | ✅ Creada |
| HechiceroEncargado | creado | ✅ Creado (Hechicero 5 → Misión 28) |
| Maldición | `en_proceso_de_exorcismo` | ✅ Actualizada |

---

### 3️⃣ Transición: Misión `Pendiente` → `EnProgreso`

**Endpoint:** `PUT /api/mision/{id}`

**Requisitos:**
- `UbicacionId` (requerido): Ubicación donde ocurre la misión
- `HechicerosIds` (requerido): Array de IDs de Hechiceros a asignar
- La Misión debe estar en `Pendiente`

**Cambios en Cascada:**
- ✅ Se crean registros **HechiceroEnMision** para cada Hechicero
- ✅ La **Solicitud** pasa a `atendida`
- ✅ La **Maldición** permanece en `en_proceso_de_exorcismo` (confirma estado)
- ℹ️ Se registran FechaYHoraDeInicio

```csharp
PUT /api/mision/28
{
  "estado": "EnProgreso",
  "ubicacionId": 3,
  "hechicerosIds": [5, 7, 9]
}

RESPUESTA 200:
{
  "success": true,
  "message": "Misión actualizada a 'en_progreso'. HechiceroEnMision, Solicitud y Maldición 
    (estado: en_proceso_de_exorcismo) generados/actualizados automáticamente.",
  "generatedData": {
    "misionId": 28,
    "hechicerosEnMisionIds": [34, 35, 36]
  }
}
```

**Estado Final:**
| Entidad | Estado | Cambios |
|---------|--------|---------|
| Misión | `EnProgreso` | ✅ Iniciada |
| HechiceroEnMision | creados (3) | ✅ Para cada Hechicero |
| Solicitud | `atendida` | ✅ Actualizada |
| Maldición | `en_proceso_de_exorcismo` | ✓ Sin cambios |

---

### 4️⃣ Transición: Misión `EnProgreso` → `CompletadaConExito`

**Endpoint:** `PUT /api/mision/{id}`

**Cambios en Cascada:**
- ✅ La **Maldición** pasa a `exorcisada` ✅ **FIN DEL CICLO**
- ✅ Se registra FechaYHoraDeFin
- ℹ️ La Solicitud permanece en `atendida`

```csharp
PUT /api/mision/28
{
  "estado": "CompletadaConExito"
}

RESPUESTA 200:
{
  "success": true,
  "message": "Misión completada con éxito. Maldición marcada como exorcisada",
  "generatedData": {
    "misionId": 28
  }
}
```

**Estado Final:**
| Entidad | Estado | Cambios |
|---------|--------|---------|
| Misión | `CompletadaConExito` | ✅ Finalizada |
| Maldición | `exorcisada` | ✅ **VICTORIA** |
| Solicitud | `atendida` | ✓ Sin cambios |

---

### 5️⃣ Transición: Misión `EnProgreso` → `CompletadaConFracaso`

**Endpoint:** `PUT /api/mision/{id}`

**Cambios en Cascada:**
- ✅ La **Maldición** vuelve a `activa` (revive)
- ✅ La **Solicitud** vuelve a `pendiente` (permite reintentos)
- ℹ️ Se registra FechaYHoraDeFin

```csharp
PUT /api/mision/28
{
  "estado": "CompletadaConFracaso"
}

RESPUESTA 200:
{
  "success": true,
  "message": "Misión completada con fracaso. Solicitud y Maldición devueltas a estado anterior",
  "generatedData": {
    "misionId": 28
  }
}
```

**Estado Final:**
| Entidad | Estado | Cambios |
|---------|--------|---------|
| Misión | `CompletadaConFracaso` | ✅ Finalizada |
| Maldición | `activa` | ✅ Revive - reintentar |
| Solicitud | `pendiente` | ✅ Reinicia para reintento |

**Flujo de Reintento:**
```
SOLICITUD actualizada a pendiente
    ↓
    └──> Posibilidad de cambiar HechiceroEncargado
         └──> Volver a poner Solicitud en "atendiendose"
              └──> Nueva Misión con mejor equipo
```

---

### 6️⃣ Transición: Misión `EnProgreso` → `Cancelada`

**Endpoint:** `PUT /api/mision/{id}`

**Cambios en Cascada:**
- ✅ La **Maldición** vuelve a `activa`
- ✅ La **Solicitud** vuelve a `pendiente`
- ℹ️ Se registra FechaYHoraDeFin

```csharp
PUT /api/mision/28
{
  "estado": "Cancelada"
}

RESPUESTA 200:
{
  "success": true,
  "message": "Misión cancelada, Solicitud y Maldición devueltas a 'pendiente' y 'activa'",
  "generatedData": {
    "misionId": 28
  }
}
```

**Estado Final:**
| Entidad | Estado | Cambios |
|---------|--------|---------|
| Misión | `Cancelada` | ✅ Cancelada |
| Maldición | `activa` | ✅ Vuelve a activa |
| Solicitud | `pendiente` | ✅ Vuelve a pendiente |

---

### 7️⃣ Cambio de HechiceroEncargado (dentro de `atendiendose`)

**Endpoint:** `PUT /api/solicitud/{id}`

**Requisito:**
- La Solicitud debe estar en `atendiendose`
- Incluir nuevo `HechiceroEncargadoId` diferente

**Lógica Especial - Caso A vs Caso B:**

#### **CASO A: Si el Hechicero actual atiende múltiples misiones**
- ✅ Se **crea un nuevo HechiceroEncargado** con el nuevo Hechicero
- ✅ Se **elimina el anterior** de esta misión
- ℹ️ El Hechicero anterior sigue atendiendo sus otras misiones

```csharp
ESCENARIO:
- Hechicero A atiende Misión 1 y Misión 2
- Solicitud = Misión 1 (via HechiceroEncargado)
- Cambio: Hechicero A → Hechicero B

RESULTADO:
- Hechicero A: sigue en Misión 2 ✓
- Misión 1: ahora asignada a Hechicero B ✓
```

#### **CASO B: Si el Hechicero actual atiende solo una misión**
- ✅ Se **actualiza el HechiceroId** del HechiceroEncargado existente
- ℹ️ No se crea uno nuevo, se reutiliza

```csharp
ESCENARIO:
- Hechicero A atiende SOLO Misión 1
- Cambio: Hechicero A → Hechicero B

RESULTADO:
- HechiceroEncargado (mismo ID) ahora apunta a Hechicero B ✓
```

**Código de Solicitud:**

```csharp
PUT /api/solicitud/42
{
  "estado": "atendiendose",
  "hechiceroEncargadoId": 8  // Cambiar de ID 5 a 8
}

RESPUESTA 200 (Caso A):
{
  "success": true,
  "message": "HechiceroEncargado actualizado (nuevo creado). 
    Hechicero anterior removido de esta misión.",
  "generatedData": {
    "hechiceroEncargadoId": 15  // NUEVO ID
  }
}

RESPUESTA 200 (Caso B):
{
  "success": true,
  "message": "HechiceroEncargado actualizado.",
  "generatedData": {
    "hechiceroEncargadoId": 12  // MISMO ID
  }
}
```

---

### 8️⃣ Cambio de NivelUrgencia (dentro de `atendiendose`)

**Endpoint:** `PUT /api/solicitud/{id}`

**Requisito:**
- La Solicitud debe estar en `atendiendose`
- Incluir nuevo `NivelUrgencia` diferente al actual

**Cambios en Cascada:**
- ✅ El **NivelUrgencia de la Misión** se actualiza
- ℹ️ La Maldición no cambia

```csharp
PUT /api/solicitud/42
{
  "estado": "atendiendose",
  "nivelUrgencia": "Urgente"  // Cambio de urgencia
}

RESPUESTA 200:
{
  "success": true,
  "message": "NivelUrgencia de la Misión actualizado.",
  "generatedData": {
    "nivelUrgencia": "Urgente"
  }
}
```

**Estado Final:**
| Entidad | Estado | Cambios |
|---------|--------|---------|
| Misión | NivelUrgencia actualizado | ✅ De `EmergenciaCritica` a `Urgente` |

---

## 🎪 Casos Esquinados

### Caso 1: Intentar cambiar a `atendiendose` sin HechiceroEncargadoId

```csharp
PUT /api/solicitud/42
{
  "estado": "atendiendose",
  "nivelUrgencia": "Urgente"
  // FALTA: hechiceroEncargadoId
}

RESPUESTA 400:
{
  "success": false,
  "message": "Se requiere HechiceroEncargadoId para cambiar a estado 'atendiendose'",
  "generatedData": null
}
```

---

### Caso 2: Hechicero no existe

```csharp
PUT /api/solicitud/42
{
  "estado": "atendiendose",
  "hechiceroEncargadoId": 9999,  // No existe
  "nivelUrgencia": "Urgente"
}

RESPUESTA 400:
{
  "success": false,
  "message": "El Hechicero con ID 9999 no existe",
  "generatedData": null
}
```

---

### Caso 3: Maldición Desconocida (Huérfana)

**Escenario:** Se referencia una Maldición que fue eliminada pero un registro aún la menciona.

**Behavior:** Se **crea automáticamente** una Maldición "desconocida"

```csharp
GET /api/maldicion/9999  // No existe

RESPUESTA 200:
{
  "id": 9999,
  "nombre": "Desconocida",
  "grado": "especial",
  "tipo": "desconocida",
  "estado": "activa",
  "nivelPeligro": "alto",
  "message": "Auto-creada Maldición desconocida para referencia huérfana"
}
```

**Propósito:** Mantener integridad referencial sin causar errores en cascada.

---

### Caso 4: Cancelar Misión en Progreso

```csharp
ESTADO ANTES:
- Misión: EnProgreso
- Solicitud: atendida
- Maldición: en_proceso_de_exorcismo

PUT /api/mision/28
{
  "estado": "Cancelada"
}

ESTADO DESPUÉS:
- Misión: Cancelada
- Solicitud: pendiente (¡revirtió!)
- Maldición: activa (¡revirtió!)
```

---

### Caso 5: Eliminar Solicitud con Misión en Progreso

```csharp
DELETE /api/solicitud/42

COMPORTAMIENTO:
- Solicitud: Eliminada
- Misión: Estado → Cancelada (NO se elimina)
- Maldición: Permanece en estado actual
- HechiceroEncargado: Permanece (referencia histórica)
```

**Nota:** Se evita eliminar datos; solo se cancela la Misión.

---

### Caso 6: Intentar Transición No Permitida

```csharp
MISIÓN EN ESTADO: Cancelada

PUT /api/mision/28
{
  "estado": "EnProgreso"  // Intentar reversar
}

RESPUESTA 400:
{
  "success": false,
  "message": "Transición de estado no permitida: Cancelada → EnProgreso",
  "generatedData": null
}
```

**Transiciones Permitidas:**
- Pendiente → EnProgreso, CompletadaConExito (❌), CompletadaConFracaso (❌), Cancelada (❌)
- EnProgreso → CompletadaConExito, CompletadaConFracaso, Cancelada
- CompletadaConExito/CompletadaConFracaso/Cancelada → ❌ (terminales)

---

## 💻 Ejemplos de Código

### Flujo Completo en Frontend (Pseudocódigo)

```javascript
// 1. Crear Maldición
const maldicionResp = await fetch('/api/maldicion', {
  method: 'POST',
  body: JSON.stringify({
    nombre: 'Espíritu Vengador',
    grado: 'especial',
    tipo: 'maligna',
    nivelPeligro: 'alto'
  })
});
const { maldicionId, solicitudId } = maldicionResp.generatedData;
// ✅ Maldición: activa
// ✅ Solicitud: pendiente

// 2. Asignar Hechicero (pendiente → atendiendose)
const solicitudResp = await fetch(`/api/solicitud/${solicitudId}`, {
  method: 'PUT',
  body: JSON.stringify({
    estado: 'atendiendose',
    hechiceroEncargadoId: 5,
    nivelUrgencia: 'EmergenciaCritica'
  })
});
const { misionId, hechiceroEncargadoId } = solicitudResp.generatedData;
// ✅ Solicitud: atendiendose
// ✅ Misión: Pendiente (creada)
// ✅ Maldición: en_proceso_de_exorcismo

// 3. Iniciar Misión (Pendiente → EnProgreso)
const misionStartResp = await fetch(`/api/mision/${misionId}`, {
  method: 'PUT',
  body: JSON.stringify({
    estado: 'EnProgreso',
    ubicacionId: 3,
    hechicerosIds: [5, 7, 9]
  })
});
// ✅ Misión: EnProgreso
// ✅ Solicitud: atendida
// ✅ Maldición: en_proceso_de_exorcismo (confirmado)

// 4. Completar con Éxito (EnProgreso → CompletadaConExito)
const misionEndResp = await fetch(`/api/mision/${misionId}`, {
  method: 'PUT',
  body: JSON.stringify({
    estado: 'CompletadaConExito'
  })
});
// ✅ Misión: CompletadaConExito
// ✅ Maldición: exorcisada 🎉
// ✅ Ciclo completo
```

---

### Cambiar HechiceroEncargado en Progreso

```javascript
// Solicitud en "atendiendose" - cambiar Hechicero
const changeResp = await fetch(`/api/solicitud/${solicitudId}`, {
  method: 'PUT',
  body: JSON.stringify({
    estado: 'atendiendose',
    hechiceroEncargadoId: 8  // Nuevo Hechicero
  })
});

const { success, message, generatedData } = changeResp;

if (message.includes('nuevo creado')) {
  console.log('CASO A: Hechicero anterior atendía múltiples misiones');
  console.log('Nuevo HechiceroEncargado ID:', generatedData.hechiceroEncargadoId);
} else {
  console.log('CASO B: Hechicero anterior atendía solo esta misión');
  console.log('HechiceroEncargado ID (mismo):', generatedData.hechiceroEncargadoId);
}
```

---

### Reintento tras Fracaso

```javascript
// 1. Misión falla
const failResp = await fetch(`/api/mision/${misionId}`, {
  method: 'PUT',
  body: JSON.stringify({
    estado: 'CompletadaConFracaso'
  })
});
// ✅ Maldición: activa (revivió)
// ✅ Solicitud: pendiente (reinicia)

// 2. Obtener Maldición nuevamente (ahora está activa)
const maldicionActual = await fetch(`/api/maldicion/${maldicionId}`);
console.log(maldicionActual.estado); // activa

// 3. Reasignar con mejor equipo
const retryResp = await fetch(`/api/solicitud/${solicitudId}`, {
  method: 'PUT',
  body: JSON.stringify({
    estado: 'atendiendose',
    hechiceroEncargadoId: 10,  // Hechicero más fuerte
    nivelUrgencia: 'EmergenciaCritica'
  })
});
const { misionId: newMisionId } = retryResp.generatedData;
// ✅ Nueva Misión creada
// ✅ Maldición: en_proceso_de_exorcismo de nuevo
```

---

## 📱 Guía para el Frontend

### Estado Global Recomendado

```typescript
interface AppState {
  maldiciones: Maldicion[];
  solicitudes: Solicitud[];
  misiones: Mision[];
  hechiceros: Hechicero[];
  hechicerosEncargados: HechiceroEncargado[];
  
  // UI State
  selectedMaldicion: Maldicion | null;
  selectedSolicitud: Solicitud | null;
  selectedMision: Mision | null;
}

interface Maldicion {
  id: number;
  nombre: string;
  estado: 'activa' | 'en_proceso_de_exorcismo' | 'exorcisada';
  grado: string;
  tipo: string;
}

interface Solicitud {
  id: number;
  maldicionId: number;
  estado: 'pendiente' | 'atendiendose' | 'atendida';
  maldicion?: Maldicion; // relación
}

interface Mision {
  id: number;
  estado: 'Pendiente' | 'EnProgreso' | 'CompletadaConExito' | 'CompletadaConFracaso' | 'Cancelada';
  nivelUrgencia: 'Planificada' | 'Urgente' | 'EmergenciaCritica';
  hechicerosCount: number;
}
```

---

### Componentes Clave a Implementar

#### 1. **Dashboard de Maldiciones**

```typescript
// Mostrar:
// - Lista de Maldiciones con estado (color: rojo=activa, naranja=en_proceso, verde=exorcisada)
// - Click en Maldición → ver Solicitud asociada
// - Estado actual de cascada

export function MaldicionCard({ maldicion }: { maldicion: Maldicion }) {
  const estadoColor = {
    'activa': '#FF6B6B',                    // Rojo
    'en_proceso_de_exorcismo': '#FFA500',   // Naranja
    'exorcisada': '#51CF66'                 // Verde
  };

  return (
    <Card style={{ borderLeft: `4px solid ${estadoColor[maldicion.estado]}` }}>
      <h3>{maldicion.nombre}</h3>
      <p>Estado: {maldicion.estado}</p>
      <p>Grado: {maldicion.grado}</p>
      <Button onClick={() => navigateToSolicitud(maldicion.id)}>
        Ver Solicitud
      </Button>
    </Card>
  );
}
```

---

#### 2. **Panel de Asignación (Pendiente → Atendiendose)**

```typescript
// Mostrar:
// - Solicitud en estado "pendiente"
// - Selector de Hechicero
// - Selector de Nivel Urgencia
// - Botón "Asignar" → PUT /api/solicitud/{id}

export function AsignacionPanel({ solicitud }: { solicitud: Solicitud }) {
  const [hechiceroId, setHechiceroId] = useState<number | null>(null);
  const [nivelUrgencia, setNivelUrgencia] = useState<ENivelUrgencia | null>(null);

  const handleAsignar = async () => {
    const response = await fetch(`/api/solicitud/${solicitud.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: 'atendiendose',
        hechiceroEncargadoId: hechiceroId,
        nivelUrgencia
      })
    });
    
    if (response.ok) {
      // Refrescar datos
      // ✅ Misión creada automáticamente
      // ✅ Maldición: en_proceso_de_exorcismo
      showNotification('Solicitud asignada, Misión creada');
    }
  };

  return (
    <div>
      <h3>Asignar Hechicero a Maldición</h3>
      <HechiceroSelector onChange={setHechiceroId} />
      <NivelUrgenciaSelector onChange={setNivelUrgencia} />
      <Button onClick={handleAsignar}>Asignar</Button>
    </div>
  );
}
```

---

#### 3. **Control de Misión (Pendiente → EnProgreso)**

```typescript
// Mostrar:
// - Misión creada pero no iniciada (Pendiente)
// - Selector de Ubicación
// - Multi-selector de Hechiceros
// - Botón "Iniciar Misión" → PUT /api/mision/{id}

export function MisionStartControl({ mision }: { mision: Mision }) {
  const [ubicacionId, setUbicacionId] = useState<number | null>(null);
  const [hechicerosIds, setHechicerosIds] = useState<number[]>([]);

  const handleIniciar = async () => {
    const response = await fetch(`/api/mision/${mision.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: 'EnProgreso',
        ubicacionId,
        hechicerosIds
      })
    });
    
    if (response.ok) {
      // ✅ HechiceroEnMision creados
      // ✅ Solicitud: atendida
      // ✅ Maldición: en_proceso_de_exorcismo (confirmado)
      showNotification('Misión iniciada');
    }
  };

  return (
    <div>
      <h3>Iniciar Misión</h3>
      <UbicacionSelector onChange={setUbicacionId} />
      <HechicerosMultiSelect onChange={setHechicerosIds} />
      <Button onClick={handleIniciar}>Iniciar Misión</Button>
    </div>
  );
}
```

---

#### 4. **Completar Misión (EnProgreso → Completada)**

```typescript
// Mostrar:
// - Misión en EnProgreso
// - Botón "Éxito" → CompletadaConExito
// - Botón "Fracaso" → CompletadaConFracaso
// - Botón "Cancelar" → Cancelada
// - Diferente visualización para cada resultado

export function MisionResultControl({ mision }: { mision: Mision }) {
  const handleResult = async (result: 'CompletadaConExito' | 'CompletadaConFracaso' | 'Cancelada') => {
    const response = await fetch(`/api/mision/${mision.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: result })
    });
    
    if (response.ok) {
      const data = response.generatedData;
      switch(result) {
        case 'CompletadaConExito':
          // ✅ Maldición: exorcisada 🎉
          showNotification('¡Maldición exorcisada!', 'success');
          break;
        case 'CompletadaConFracaso':
          // ✅ Maldición: activa (reintentar)
          // ✅ Solicitud: pendiente
          showNotification('Misión fallida. Reintentar con nuevo equipo.', 'warning');
          break;
        case 'Cancelada':
          // ✅ Maldición: activa, Solicitud: pendiente
          showNotification('Misión cancelada.', 'info');
      }
    }
  };

  return (
    <div>
      <h3>Resultado de Misión</h3>
      <Button onClick={() => handleResult('CompletadaConExito')} style={{ background: '#51CF66' }}>
        ✅ Éxito - Exorcismo
      </Button>
      <Button onClick={() => handleResult('CompletadaConFracaso')} style={{ background: '#FFA500' }}>
        ❌ Fracaso - Reintentar
      </Button>
      <Button onClick={() => handleResult('Cancelada')} style={{ background: '#808080' }}>
        ⊘ Cancelar
      </Button>
    </div>
  );
}
```

---

#### 5. **Cambio de Hechicero en Progreso**

```typescript
// Mostrar:
// - Solicitud en estado "atendiendose"
// - Selector de nuevo Hechicero
// - Botón "Cambiar Hechicero"

export function HechiceroChangeControl({ solicitud }: { solicitud: Solicitud }) {
  const [nuevoHechiceroId, setNuevoHechiceroId] = useState<number | null>(null);

  const handleCambio = async () => {
    const response = await fetch(`/api/solicitud/${solicitud.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: 'atendiendose',
        hechiceroEncargadoId: nuevoHechiceroId
      })
    });
    
    if (response.ok) {
      const { success, message } = response;
      
      if (message.includes('nuevo creado')) {
        showNotification('Nuevo Hechicero asignado (anterior seguía otras misiones)', 'info');
      } else {
        showNotification('Hechicero actualizado en esta misión', 'info');
      }
      
      // Refrescar datos
    }
  };

  return (
    <div>
      <h3>Cambiar Hechicero Encargado</h3>
      <HechiceroSelector onChange={setNuevoHechiceroId} />
      <Button onClick={handleCambio}>Cambiar</Button>
    </div>
  );
}
```

---

### Tabla de Responsividad (QUÉ CAMBIA DÓNDE)

| Acción | Componente | Cambios Inmediatos | Cambios en Cascada |
|--------|-----------|-------------------|--------------------|
| Crear Maldición | Dashboard | Maldición:activa | Solicitud:pendiente |
| Asignar (pendiente→atendiendose) | AsignacionPanel | Solicitud:atendiendose | Misión:Pendiente, Maldición:en_proceso |
| Iniciar Misión | MisionStartControl | Misión:EnProgreso | Solicitud:atendida |
| Completar Éxito | MisionResultControl | Misión:CompletadaConExito | Maldición:exorcisada ✅ |
| Completar Fracaso | MisionResultControl | Misión:CompletadaConFracaso | Maldición:activa, Solicitud:pendiente |
| Cambiar Hechicero | HechiceroChangeControl | HechiceroEncargado | Puede crear nuevo o actualizar |

---

## 🔗 Endpoints REST

### Maldición

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/maldicion` | Listar todas |
| GET | `/api/maldicion/{id}` | Obtener una (crea "desconocida" si no existe) |
| POST | `/api/maldicion` | Crear + auto-genera Solicitud |
| PUT | `/api/maldicion/{id}` | Actualizar |
| DELETE | `/api/maldicion/{id}` | Eliminar |

### Solicitud

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/solicitud` | Listar todas |
| GET | `/api/solicitud/{id}` | Obtener una |
| PUT | `/api/solicitud/{id}` | **Actualizar con cascada** |
| DELETE | `/api/solicitud/{id}` | Eliminar (Misión → Cancelada) |

### Misión

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/mision` | Listar todas |
| GET | `/api/mision/{id}` | Obtener una |
| POST | `/api/mision` | Crear (solo uso interno) |
| PUT | `/api/mision/{id}` | **Actualizar con cascada** |
| DELETE | `/api/mision/{id}` | Eliminar (con lógica especial) |

---

## 📤 Respuestas del API

### Formato General de Respuesta

```json
{
  "success": true|false,
  "message": "Descripción de lo que pasó",
  "generatedData": {
    "id": 123,
    "otrosCampos": "..."
  } | null
}
```

### Respuesta: Crear Maldición

```json
{
  "success": true,
  "message": "Maldición creada. Solicitud generada automáticamente.",
  "generatedData": {
    "maldicionId": 15,
    "solicitudId": 42
  }
}
```

### Respuesta: Asignar (pendiente → atendiendose)

```json
{
  "success": true,
  "message": "Solicitud actualizada. Misión y HechiceroEncargado generados automáticamente.",
  "generatedData": {
    "misionId": 28,
    "hechiceroEncargadoId": 12
  }
}
```

### Respuesta: Iniciar Misión (Pendiente → EnProgreso)

```json
{
  "success": true,
  "message": "Misión actualizada a 'en_progreso'. HechiceroEnMision, Solicitud y Maldición (estado: en_proceso_de_exorcismo) generados/actualizados automáticamente.",
  "generatedData": {
    "misionId": 28,
    "hechicerosEnMisionIds": [34, 35, 36]
  }
}
```

### Respuesta: Completar Éxito

```json
{
  "success": true,
  "message": "Misión completada con éxito. Maldición marcada como exorcisada",
  "generatedData": {
    "misionId": 28
  }
}
```

### Respuesta: Completar Fracaso

```json
{
  "success": true,
  "message": "Misión completada con fracaso. Solicitud y Maldición devueltas a estado anterior",
  "generatedData": {
    "misionId": 28
  }
}
```

### Respuesta: Cambiar Hechicero - Caso A (Nuevo)

```json
{
  "success": true,
  "message": "HechiceroEncargado actualizado (nuevo creado). Hechicero anterior removido de esta misión.",
  "generatedData": {
    "hechiceroEncargadoId": 15
  }
}
```

### Respuesta: Cambiar Hechicero - Caso B (Actualizar)

```json
{
  "success": true,
  "message": "HechiceroEncargado actualizado.",
  "generatedData": {
    "hechiceroEncargadoId": 12
  }
}
```

### Respuesta: Error

```json
{
  "success": false,
  "message": "Se requiere HechiceroEncargadoId para cambiar a estado 'atendiendose'",
  "generatedData": null
}
```

---

## 📊 Diagrama de Máquina de Estados

```
┌─────────────────────────────────────────────────────────────────┐
│ MALDICION - MÁQUINA DE ESTADOS                                   │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │    ACTIVA        │
    │ (Inicial)        │
    │ (Revive)         │
    └────────┬─────────┘
             │ Solicitud: pendiente → atendiendose
             │ + Misión creada + HechiceroEncargado
             ▼
    ┌──────────────────┐
    │EN_PROCESO_DE_    │
    │EXORCISMO         │
    │                  │
    └────────┬─────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼ ÉXITO           ▼ FRACASO/CANCELADA
    │                 │
    ├─► ┌──────────────┐ ──┐
    │   │ EXORCISADA   │   │ Vuelve a ACTIVA
    │   │ (FIN)        │   │ + Solicitud: pendiente
    │   └──────────────┘ ◄─┘
    │
    └─► (FIN DE CICLO - VICTORIA)
```

---

## ✅ Checklist de Implementación Frontend

- [ ] **Componentes de Maldición**
  - [ ] Dashboard/List con estado visual (colores)
  - [ ] Detail view
  - [ ] Crear Maldición (form)
  
- [ ] **Componentes de Solicitud**
  - [ ] List filtrada por Maldición
  - [ ] Estado visual (pendiente/atendiendose/atendida)
  - [ ] Panel de asignación (pendiente → atendiendose)
  - [ ] Panel de cambio de Hechicero (atendiendose → atendiendose)
  - [ ] Panel de cambio de Urgencia
  
- [ ] **Componentes de Misión**
  - [ ] Detail view
  - [ ] Panel de inicio (Pendiente → EnProgreso)
  - [ ] Panel de resultado (Éxito/Fracaso/Cancelada)
  - [ ] Timeline de estados
  
- [ ] **Integración de API**
  - [ ] Error handling global
  - [ ] Refresh automático de datos tras cascada
  - [ ] Loading states
  - [ ] Toast notifications
  
- [ ] **Estado Global**
  - [ ] Redux/Zustand store con entidades
  - [ ] Sincronización tras actualizaciones
  - [ ] Cache invalidation strategy

---

## 🎓 Resumen para Desarrollador Frontend

### El Sistema es Autosuficiente

✅ **No duplicar la lógica de cascada en frontend**  
El backend maneja TODA la cascada. El frontend solo:
1. Envía requests
2. Recibe respuestas
3. Actualiza UI
4. Re-fetcha datos si necesario

### Patrones Clave

1. **Obtener datos con sus relaciones**: GET endpoints retornan entidades completas
2. **PUT para cambios de estado**: Siempre con objeto `{ estado: ... }`
3. **generatedData**: Contiene los IDs de entidades creadas automáticamente
4. **Message en respuesta**: Lee el mensaje para entender qué sucedió

### Flujo Típico en Frontend

```
1. Usuario interactúa (click en botón)
2. Mostrar loading
3. Hacer request PUT/POST al backend
4. Si error: mostrar mensaje de error
5. Si éxito: 
   - Leer generatedData
   - Mostrar notification
   - Re-fetch datos necesarios
   - Actualizar UI
6. Ocultar loading
```

---

## 📚 Recursos Adicionales

- **Tests**: Ver `MisionServicePhase2Tests.cs` y `SolicitudServicePhase1Tests.cs` para ejemplos
- **DTOs**: `MisionUpdateRequest.cs`, `SolicitudUpdateRequest.cs`
- **Repositorios**: Implementan la persistencia sin lógica de negocio
- **Enums**: Definidos en models para asegurar consistencia

---

**Fin de Documentación**
