# 📋 Plan de Implementación - Frontend: Flujo de Cascada Maldición → Solicitud → Misión

**Fecha:** Diciembre 2025  
**Estado:** 🟢 Plan Detallado  
**Duración Estimada:** 4-5 sprints (2-3 semanas de desarrollo)

---

## 📑 Tabla de Contenidos

1. [Visión General del Plan](#visión-general-del-plan)
2. [Análisis de Estructura Actual](#análisis-de-estructura-actual)
3. [Cambios Necesarios por Capa](#cambios-necesarios-por-capa)
4. [Plan de Ejecución Fase a Fase](#plan-de-ejecución-fase-a-fase)
5. [Matriz de Dependencias](#matriz-de-dependencias)
6. [Checklist de Implementación](#checklist-de-implementación)

---

## 🎯 Visión General del Plan

### Objetivo
Implementar en el frontend el flujo de cascada automática donde:
- Crear Maldición → auto-crea Solicitud
- Cambiar Solicitud (pendiente → atendiendose) → auto-crea Misión + HechiceroEncargado
- Cambiar Misión → sincroniza estado con Solicitud y Maldición

### Arquitectura Actual (Análisis)

```
Frontend (React/TypeScript)
├── api/
│   ├── client.ts (Axios + interceptores)
│   ├── curseApi.ts
│   ├── requestApi.ts
│   ├── missionApi.ts
│   └── sorcererInChargeApi.ts ⚠️ (NO existe)
├── hooks/
│   ├── useCurses.ts / useInfiniteCurses.ts
│   ├── useRequests.ts / useInfiniteRequests.ts
│   ├── useMissions.ts / useInfiniteMissions.ts
│   └── useSorcerers.ts / useInfiniteSorcerers.ts
├── types/
│   ├── curse.ts (estados: activa, en_proceso_de_exorcismo, exorcisada ✓)
│   ├── request.ts (estados: pendiente, atendiendose, atendida ✓)
│   ├── mission.ts (estados: pending, in_progress, success, failure, canceled ✓)
│   └── sorcererInCharge.ts ⚠️ (NO existe)
└── pages/
    ├── curses/CursesPage.tsx (CRUD básico)
    ├── requests/RequestsPage.tsx (CRUD básico)
    ├── missions/MissionsPage.tsx (CRUD básico, 531 líneas)
    └── sorcerers-in-charge/ ⚠️ (NO existe)
```

### Problemas Identificados

| Problema | Impacto | Severidad |
|----------|--------|-----------|
| requestApi.ts no maneja cascada (crear Maldición) | No auto-crea Solicitud | 🔴 Alta |
| requestApi.ts no valida cambios de estado | Permite transiciones inválidas | 🔴 Alta |
| missionApi.ts no valida cambios de estado | Permite transiciones inválidas | 🔴 Alta |
| No existe sorcererInChargeApi.ts | No maneja cambio de Hechicero | 🔴 Alta |
| useSorcerersInCharge.ts hook no existe | No maneja estado de HechiceroEncargado | 🔴 Alta |
| Pages no muestran cascada en UI | Usuario no ve qué cambios se hacen | 🟡 Media |
| No existe tipo SorcererInCharge | No se puede tipificar datos | 🟡 Media |
| RequestsPage no permite cambiar Hechicero | No implementa cambio de Hechicero | 🔴 Alta |
| MissionsPage no implementa lógica de cascada | No dispara cambios automáticos | 🔴 Alta |

---

## 🏗️ Análisis de Estructura Actual

### 1. API Layer (api/)

#### ✅ Existente: curseApi.ts
```typescript
// Estructura:
- list() → GET /maldicion
- get(id) → GET /maldicion/{id}
- create(payload) → POST /maldicion
- update(id, payload) → PUT /maldicion/{id}
- remove(id) → DELETE /maldicion/{id}

// CAMBIO NECESARIO: normalizeMaldicion() no traduce estados
// Pendiente: Agregar validación de cascada en create()
```

#### ✅ Existente: requestApi.ts
```typescript
// Estructura ACTUAL - SIMPLISTA:
- list() → GET /Solicitud
- get(id) → GET /Solicitud/{id}
- create(payload) → POST /Solicitud
- update(id, payload) → PUT /Solicitud/{id}
- remove(id) → DELETE /Solicitud/{id}

// CAMBIOS NECESARIOS:
// 1. update() debe recibir { estado, hechiceroEncargadoId?, nivelUrgencia? }
// 2. Validar transiciones permitidas
// 3. Interpretar generatedData de respuesta
// 4. Manejo de Caso A vs B (crear nuevo vs actualizar HechiceroEncargado)
```

#### ✅ Existente: missionApi.ts
```typescript
// Estructura ACTUAL:
- list()
- get(id)
- create(payload)
- update(id, payload) → PUT /Mision/{id}
- remove(id)

// CAMBIOS NECESARIOS:
// 1. update() debe recibir { estado, ubicacionId?, hechicerosIds? }
// 2. Validar transiciones de misión
// 3. Manejo de respuestas complejas (success/generatedData)
```

#### ❌ Faltante: sorcererInChargeApi.ts
```typescript
// CREAR NUEVO ARCHIVO con:
- list() → GET /HechiceroEncargado
- get(id) → GET /HechiceroEncargado/{id}
- create(payload) → POST /HechiceroEncargado
- update(id, payload) → PUT /HechiceroEncargado/{id}
- remove(id) → DELETE /HechiceroEncargado/{id}
```

### 2. Types Layer (types/)

#### ✅ Existente: curse.ts
```typescript
// Tiene:
- CURSE_STATE (activa, en_proceso_de_exorcismo, exorcisada) ✓
- CURSE_GRADE, CURSE_TYPE, CURSE_DANGER_LEVEL
- Interface Curse completa

// CAMBIOS: Agregar traducción de estados en normalizeMaldicion()
```

#### ✅ Existente: request.ts
```typescript
// Tiene:
- RequestStatus (pendiente, atendiendose, atendida) ✓
- Interface Request (id, maldicionId, estado)

// CAMBIOS: Agregar interface UpdateRequestPayload
```

#### ✅ Existente: mission.ts
```typescript
// Tiene:
- MISSION_STATE (pending, in_progress, success, failure, canceled) ✓
- MISSION_URGENCY (planned, urgent, critical)
- Interface Mission (id, startAt, endAt, locationId, state, urgency, etc.)

// CAMBIOS: Agregar interface UpdateMissionPayload
```

#### ❌ Faltante: sorcererInCharge.ts
```typescript
// CREAR con:
interface SorcererInCharge {
  id: number;
  hechiceroId: number;
  solicitudId: number;
  misionId: number;
}

type NewSorcererInCharge = Omit<SorcererInCharge, 'id'>;
```

### 3. Hooks Layer (hooks/)

#### ✅ Existente: useCurses.ts
```typescript
// Estructura estándar con:
- list: useQuery (fetch all)
- create: useMutation (POST)
- update: useMutation (PUT)
- remove: useMutation (DELETE)

// CAMBIOS: Agregar lógica de validación en create()
```

#### ✅ Existente: useRequests.ts
```typescript
// Estructura estándar

// CAMBIOS:
// 1. Agregar validación de estado antes de update()
// 2. Manejar generatedData en respuesta
// 3. Invalidar caches de: solicitudes, misiones, hechicerosEncargados
```

#### ✅ Existente: useMissions.ts
```typescript
// Estructura estándar

// CAMBIOS:
// 1. Agregar validación de estado antes de update()
// 2. Manejar generatedData en respuesta
// 3. Invalidar caches de: misiones, solicitudes, maldiciones
```

#### ❌ Faltante: useSorcerersInCharge.ts
```typescript
// CREAR nuevo hook similar a useSorcerers
// Métodos: list, get, create, update, remove
```

### 4. Pages Layer (pages/)

#### 📝 CursesPage.tsx (277 líneas)
```typescript
// CAMBIOS NECESARIOS:
// 1. Mostrar estado visual de Maldición con colores
//    - Rojo: activa
//    - Naranja: en_proceso_de_exorcismo
//    - Verde: exorcisada
// 2. Al crear Maldición, mostrar toast con info de Solicitud auto-creada
// 3. Al hacer click en Maldición, navegar a Solicitud asociada
// 4. Agregar columna con estado de cascada (indicador visual)
```

#### 📝 RequestsPage.tsx (237 líneas)
```typescript
// CAMBIOS NECESARIOS:
// 1. Agregar UI condicional basada en estado:
//    - pendiente: Mostrar selector de Hechicero + NivelUrgencia
//    - atendiendose: Mostrar cambio de Hechicero + cambio de Urgencia
//    - atendida: Solo lectura
// 2. Validar antes de cambiar estado
// 3. Mostrar toast con generatedData (misionId, hechiceroEncargadoId)
// 4. Manejar Caso A vs B para cambio de Hechicero
// 5. Mostrar referencia a Maldición + estado actual
// 6. Agregar botón "Ver Misión Asociada"
```

#### 📝 MissionsPage.tsx (531 líneas)
```typescript
// CAMBIOS NECESARIOS - MUY EXTENSO:
// 1. Agregar validación de transiciones de estado
// 2. Cambiar UI según estado actual de Misión:
//    - Pendiente: Mostrar botón "Iniciar" (Pendiente → EnProgreso)
//    - EnProgreso: Mostrar botones "Éxito", "Fracaso", "Cancelar"
//    - CompletadaConExito/Fracaso/Cancelada: Solo lectura
// 3. Al pasar a EnProgreso:
//    - Validar ubicacionId y hechicerosIds requeridos
//    - Mostrar loading
//    - Mostrar toast con generatedData
// 4. Al completar:
//    - Mostrar modal de confirmación
//    - Mostrar toast con resultado (éxito/fracaso/cancelada)
//    - Invalidar caches de Misión, Solicitud, Maldición
// 5. Agregar indicador visual de cascada (qué cambios se dispararán)
// 6. Mostrar referencia a Solicitud + estado
// 7. Agregar sección "Hechiceros en esta Misión"
```

---

## 🔄 Cambios Necesarios por Capa

### FASE 0: Preparación (Semana 1)

#### 0.1 - Crear Types Faltantes

**Archivo:** `src/types/sorcererInCharge.ts`

```typescript
/**
 * Type definitions for sorcerer in charge (HechiceroEncargado).
 * Links a sorcerer to a request and mission.
 */

export interface SorcererInCharge {
  id: number;
  hechiceroId: number;
  solicitudId: number;
  misionId: number;
}

export type NewSorcererInCharge = Omit<SorcererInCharge, 'id'>;
```

#### 0.2 - Extender Types Existentes

**Archivo:** `src/types/request.ts` - Agregar:

```typescript
/** Payload for updating a request with cascading logic */
export interface UpdateRequestPayload {
  estado: RequestStatus;
  hechiceroEncargadoId?: number;
  nivelUrgencia?: 'Planificada' | 'Urgente' | 'EmergenciaCritica';
}

/** Response from cascading request update */
export interface RequestUpdateResponse {
  success: boolean;
  message: string;
  generatedData?: {
    misionId?: number;
    hechiceroEncargadoId?: number;
    nivelUrgencia?: string;
  };
}
```

**Archivo:** `src/types/mission.ts` - Agregar:

```typescript
/** Payload for updating a mission with cascading logic */
export interface UpdateMissionPayload {
  estado: Mission['state'];
  ubicacionId?: number;
  hechicerosIds?: number[];
}

/** Response from cascading mission update */
export interface MissionUpdateResponse {
  success: boolean;
  message: string;
  generatedData?: {
    misionId?: number;
    hechicerosEnMisionIds?: number[];
    nivelUrgencia?: string;
  };
}
```

---

### FASE 1: API Layer (Semana 1)

#### 1.1 - Crear sorcererInChargeApi.ts

**Archivo:** `src/api/sorcererInChargeApi.ts`

```typescript
import { apiClient } from './client';
import { normalizePaged } from './pagedApi';
import type { SorcererInCharge, NewSorcererInCharge } from '../types/sorcererInCharge';

export const sorcererInChargeApi = {
  async list(params?: { limit?: number; cursor?: number | string }): Promise<{ 
    items: SorcererInCharge[]; 
    nextCursor?: number | string | null; 
    hasMore?: boolean 
  }> {
    const qp: string[] = [];
    if (params?.limit) qp.push(`limit=${params.limit}`);
    if (params?.cursor) qp.push(`cursor=${params.cursor}`);
    const qs = qp.length ? `?${qp.join('&')}` : '';
    const { data } = await apiClient.get(`/sorcerers-in-charge${qs}`);
    return normalizePaged<SorcererInCharge>(data, { limit: params?.limit });
  },

  async get(id: number): Promise<SorcererInCharge> {
    const { data } = await apiClient.get<SorcererInCharge>(`/sorcerers-in-charge/${id}`);
    return data;
  },

  async create(payload: NewSorcererInCharge): Promise<SorcererInCharge> {
    const { data } = await apiClient.post<SorcererInCharge>('/sorcerers-in-charge', payload);
    return data;
  },

  async update(id: number, payload: Partial<NewSorcererInCharge>): Promise<SorcererInCharge> {
    const { data } = await apiClient.put<SorcererInCharge>(`/sorcerers-in-charge/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/sorcerers-in-charge/${id}`);
  },
};
```

#### 1.2 - Actualizar requestApi.ts

**Cambios a `src/api/requestApi.ts`:**

```typescript
import type { Request, NewRequest, UpdateRequestPayload, RequestUpdateResponse } from '../types/request';

export const requestApi = {
  // ... list, get, create, remove sin cambios ...

  /**
   * Updates a request with validation and cascading logic.
   * 
   * Handles automatic creation of Mission and HechiceroEncargado
   * when transitioning from 'pendiente' to 'atendiendose'.
   * 
   * Handles HechiceroEncargado changes and NivelUrgencia updates
   * when in 'atendiendose' state.
   */
  async update(id: number, payload: UpdateRequestPayload): Promise<RequestUpdateResponse> {
    try {
      const { data } = await apiClient.put<RequestUpdateResponse>(`/requests/${id}`, payload);
      
      // Validate response structure
      if (!data.success) {
        throw new Error(data.message || 'Failed to update request');
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error updating request');
    }
  },
};
```

#### 1.3 - Actualizar missionApi.ts

**Cambios a `src/api/missionApi.ts`:**

```typescript
import type { Mission, UpdateMissionPayload, MissionUpdateResponse } from '../types/mission';

export const missionApi = {
  // ... list, get, create, remove sin cambios ...

  /**
   * Updates a mission with validation and cascading logic.
   * 
   * Handles state transitions:
   * - Pendiente → EnProgreso: requires ubicacionId, hechicerosIds
   * - EnProgreso → CompletadaConExito/Fracaso/Cancelada
   * 
   * Automatically updates associated Solicitud and Maldicion states.
   */
  async update(id: number, payload: UpdateMissionPayload): Promise<MissionUpdateResponse> {
    try {
      const { data } = await apiClient.put<MissionUpdateResponse>(`/missions/${id}`, payload);
      
      // Validate response structure
      if (!data.success) {
        throw new Error(data.message || 'Failed to update mission');
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error updating mission');
    }
  },
};
```

---

### FASE 2: Hooks Layer (Semana 1-2)

#### 2.1 - Crear useSorcerersInCharge.ts

**Archivo:** `src/hooks/useSorcerersInCharge.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sorcererInChargeApi } from '../api/sorcererInChargeApi';
import type { SorcererInCharge, NewSorcererInCharge } from '../types/sorcererInCharge';

const KEY = ['sorcerers-in-charge'];

export const useSorcerersInCharge = () => {
  const qc = useQueryClient();
  const list = useQuery({ 
    queryKey: KEY, 
    queryFn: () => sorcererInChargeApi.list() 
  });
  
  const create = useMutation({
    mutationFn: (payload: NewSorcererInCharge) => sorcererInChargeApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ 
      predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0],
    }),
  });
  
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: Partial<NewSorcererInCharge> }) => 
      sorcererInChargeApi.update(vars.id, vars.patch),
    onSuccess: () => qc.invalidateQueries({ 
      predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0],
    }),
  });
  
  const remove = useMutation({
    mutationFn: (id: number) => sorcererInChargeApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ 
      predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === KEY[0],
    }),
  });
  
  return { list, create, update, remove };
};
```

#### 2.2 - Actualizar useRequests.ts

**Cambios a `src/hooks/useRequests.ts`:**

```typescript
import type { UpdateRequestPayload, RequestUpdateResponse } from '../types/request';

export const useRequests = () => {
  const qc = useQueryClient();
  
  // ... list, create, remove sin cambios ...
  
  const update = useMutation({
    mutationFn: (vars: { id: number; payload: UpdateRequestPayload }) => 
      requestApi.update(vars.id, vars.payload),
    onSuccess: (data: RequestUpdateResponse) => {
      // Invalidate related caches after cascading update
      qc.invalidateQueries({ 
        predicate: (q) => {
          const key = q.queryKey[0];
          return key === 'requests' || key === 'missions' || key === 'sorcerers-in-charge';
        },
      });
      
      // Store generated data for UI consumption
      qc.setQueryData(['lastUpdateResponse'], data);
    },
  });
  
  return { list, create, update, remove };
};
```

#### 2.3 - Actualizar useMissions.ts

**Cambios a `src/hooks/useMissions.ts`:**

```typescript
import type { UpdateMissionPayload, MissionUpdateResponse } from '../types/mission';

export const useMissions = () => {
  const qc = useQueryClient();
  
  // ... list, create, remove sin cambios ...
  
  const update = useMutation({
    mutationFn: (vars: { id: number; patch: UpdateMissionPayload }) => 
      missionApi.update(vars.id, vars.patch),
    onSuccess: (data: MissionUpdateResponse) => {
      // Invalidate related caches
      qc.invalidateQueries({ 
        predicate: (q) => {
          const key = q.queryKey[0];
          return key === 'missions' || key === 'requests' || key === 'curses';
        },
      });
      
      // Store generated data
      qc.setQueryData(['lastUpdateResponse'], data);
    },
  });
  
  return { list, create, update, remove };
};
```

---

### FASE 3: Pages Layer (Semana 2-3)

#### 3.1 - Actualizar CursesPage.tsx

**Cambios principais:**

1. Agregar colores según estado de Maldición
2. Mostrar toast con generatedData al crear
3. Agregar navegación a Solicitud

```typescript
// En la tabla, agregar columna con estado colorizado:
<TD style={{ 
  color: c.estadoActual === 'activa' ? '#FF6B6B' : 
         c.estadoActual === 'en_proceso_de_exorcismo' ? '#FFA500' : '#51CF66'
}}>
  {c.estadoActual}
</TD>

// Al crear, leer generatedData:
if (create.data?.generatedData?.solicitudId) {
  toast.success(
    `Maldición creada. Solicitud #${create.data.generatedData.solicitudId} generada automáticamente`,
    { action: { label: 'Ver', onClick: () => navigate(`/requests/${create.data.generatedData.solicitudId}`) } }
  );
}
```

#### 3.2 - Actualizar RequestsPage.tsx

**Cambios extensos - Nuevas Secciones:**

```typescript
// 1. UI condicional según estado

if (requestToEdit.estado === 'pendiente') {
  // Mostrar: selector de Hechicero + NivelUrgencia + botón "Asignar"
} else if (requestToEdit.estado === 'atendiendose') {
  // Mostrar: 
  // - Selector para cambiar Hechicero (validar Caso A vs B)
  // - Selector para cambiar NivelUrgencia
  // - Botón "Cambiar Hechicero" y "Cambiar Urgencia" separados
  // - Mostrar tooltip: "Este cambio disparará actualización en cascada"
} else if (requestToEdit.estado === 'atendida') {
  // Solo lectura
}

// 2. Validación antes de actualizar
const validateRequestUpdate = (payload: UpdateRequestPayload) => {
  if (payload.estado === 'atendiendose' && !payload.hechiceroEncargadoId) {
    throw new Error('Se requiere Hechicero para asignar');
  }
  if (payload.estado === 'atendiendose' && !payload.nivelUrgencia) {
    throw new Error('Se requiere Nivel de Urgencia');
  }
};

// 3. Manejo de generatedData
const handleUpdate = async (payload: UpdateRequestPayload) => {
  try {
    const response = await update.mutateAsync({ id: requestId, payload });
    
    if (response.generatedData?.misionId) {
      toast.success(
        `Solicitud actualizada. Misión #${response.generatedData.misionId} creada.`,
        { action: { label: 'Ver Misión', onClick: () => navigate(`/missions/${response.generatedData.misionId}`) } }
      );
    } else if (response.generatedData?.hechiceroEncargadoId) {
      const isCaseA = response.message.includes('nuevo creado');
      toast.success(
        isCaseA 
          ? 'Nuevo Hechicero asignado (anterior seguía otras misiones)' 
          : 'Hechicero actualizado en esta misión'
      );
    } else {
      toast.success(response.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};
```

#### 3.3 - Actualizar MissionsPage.tsx

**Cambios CRÍTICOS - Nueva Lógica de Estados:**

```typescript
// 1. Estados permitidos y transiciones
const allowedTransitions: Record<Mission['state'], Mission['state'][]> = {
  [MISSION_STATE.pending]: [MISSION_STATE.in_progress],
  [MISSION_STATE.in_progress]: [
    MISSION_STATE.success,
    MISSION_STATE.failure,
    MISSION_STATE.canceled
  ],
  [MISSION_STATE.success]: [],
  [MISSION_STATE.failure]: [],
  [MISSION_STATE.canceled]: [],
};

// 2. Validar transición
const canTransition = (from: Mission['state'], to: Mission['state']): boolean => {
  return allowedTransitions[from]?.includes(to) ?? false;
};

// 3. Mostrar UI condicional
{mission.state === MISSION_STATE.pending && (
  <Button onClick={() => handleStartMission(mission.id)}>
    ▶️ Iniciar Misión
  </Button>
)}

{mission.state === MISSION_STATE.in_progress && (
  <div className="mission-result-buttons">
    <Button 
      onClick={() => handleCompleteMission(mission.id, 'success')}
      style={{ background: '#51CF66' }}
    >
      ✅ Éxito - Exorcismo
    </Button>
    <Button 
      onClick={() => handleCompleteMission(mission.id, 'failure')}
      style={{ background: '#FFA500' }}
    >
      ❌ Fracaso - Reintentar
    </Button>
    <Button 
      onClick={() => handleCompleteMission(mission.id, 'canceled')}
      style={{ background: '#808080' }}
    >
      ⊘ Cancelar
    </Button>
  </div>
)}

// 4. Manejo de transiciones
const handleStartMission = async (missionId: number) => {
  if (!selectedLocationId || selectedSorcererIds.length === 0) {
    toast.error('Selecciona ubicación y al menos un hechicero');
    return;
  }
  
  try {
    const response = await update.mutateAsync({
      id: missionId,
      patch: {
        estado: 'EnProgreso',
        ubicacionId: selectedLocationId,
        hechicerosIds: selectedSorcererIds,
      },
    });
    
    toast.success(
      `Misión iniciada. ${response.generatedData?.hechicerosEnMisionIds?.length} hechiceros asignados`
    );
  } catch (error) {
    toast.error(error.message);
  }
};

const handleCompleteMission = async (missionId: number, result: 'success' | 'failure' | 'canceled') => {
  const stateMap = {
    success: MISSION_STATE.success,
    failure: MISSION_STATE.failure,
    canceled: MISSION_STATE.canceled,
  };
  
  try {
    const response = await update.mutateAsync({
      id: missionId,
      patch: { estado: stateMap[result] },
    });
    
    const messages = {
      success: '¡Maldición exorcisada! 🎉',
      failure: 'Misión fallida. Solicitud y Maldición devueltas para reintento.',
      canceled: 'Misión cancelada. Solicitud en estado pendiente.',
    };
    
    toast.success(messages[result]);
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## 📊 Plan de Ejecución Fase a Fase

### SEMANA 1: Types + API + Hooks

| Fase | Tarea | Duración | Responsable | Estado |
|------|-------|----------|------------|--------|
| 0.1 | Crear sorcererInCharge.ts | 30 min | Dev 1 | ⬜ |
| 0.2 | Extender request.ts y mission.ts | 30 min | Dev 1 | ⬜ |
| 1.1 | Crear sorcererInChargeApi.ts | 1 h | Dev 1 | ⬜ |
| 1.2 | Actualizar requestApi.ts | 1.5 h | Dev 2 | ⬜ |
| 1.3 | Actualizar missionApi.ts | 1.5 h | Dev 2 | ⬜ |
| 2.1 | Crear useSorcerersInCharge.ts | 1 h | Dev 1 | ⬜ |
| 2.2 | Actualizar useRequests.ts | 1 h | Dev 2 | ⬜ |
| 2.3 | Actualizar useMissions.ts | 1 h | Dev 2 | ⬜ |
| **TOTAL SEMANA 1** | | **8 h** | | |

### SEMANA 2-3: Pages Layer

| Fase | Tarea | Duración | Responsable | Estado |
|------|-------|----------|------------|--------|
| 3.1 | Actualizar CursesPage.tsx | 2 h | Dev 1 | ⬜ |
| 3.2 | Actualizar RequestsPage.tsx | 4 h | Dev 2 | ⬜ |
| 3.2.1 | UI condicional por estado | 2 h | Dev 2 | ⬜ |
| 3.2.2 | Validación + generatedData | 2 h | Dev 2 | ⬜ |
| 3.3 | Actualizar MissionsPage.tsx | 6 h | Dev 3 | ⬜ |
| 3.3.1 | Lógica de transiciones | 2 h | Dev 3 | ⬜ |
| 3.3.2 | Cambio de estado Pendiente → EnProgreso | 2 h | Dev 3 | ⬜ |
| 3.3.3 | Cambio de estado EnProgreso → Completada | 2 h | Dev 3 | ⬜ |
| **TOTAL SEMANA 2-3** | | **14 h** | | |

### SEMANA 4: Testing + Ajustes

| Fase | Tarea | Duración | Responsable | Estado |
|------|-------|----------|------------|--------|
| 4.1 | Testing manual de flujo completo | 3 h | QA | ⬜ |
| 4.2 | Testing de casos esquinados | 2 h | QA | ⬜ |
| 4.3 | Ajustes UI/UX basados en testing | 2 h | Dev | ⬜ |
| 4.4 | Optimización de performance | 1 h | Dev | ⬜ |
| **TOTAL SEMANA 4** | | **8 h** | | |

**TOTAL ESTIMADO: 30 horas (3-4 semanas)**

---

## 🔗 Matriz de Dependencias

```
FASE 0 (Types)
    ↓
FASE 1 (API)
    ↓
FASE 2 (Hooks) ← Depende de FASE 1
    ↓
FASE 3 (Pages) ← Depende de FASE 0, 1, 2
    ↓
FASE 4 (Testing) ← Depende de FASE 3
```

### Parallelización Posible

```
SEMANA 1:
  Dev 1: 0.1, 0.2, 1.1, 2.1
  Dev 2: 1.2, 1.3, 2.2, 2.3

SEMANA 2-3:
  Dev 1: 3.1
  Dev 2: 3.2
  Dev 3: 3.3
```

---

## ✅ Checklist de Implementación

### TIPOS Y INTERFACES
- [ ] Crear `src/types/sorcererInCharge.ts`
- [ ] Agregar `UpdateRequestPayload` a `src/types/request.ts`
- [ ] Agregar `RequestUpdateResponse` a `src/types/request.ts`
- [ ] Agregar `UpdateMissionPayload` a `src/types/mission.ts`
- [ ] Agregar `MissionUpdateResponse` a `src/types/mission.ts`

### API LAYER
- [ ] Crear `src/api/sorcererInChargeApi.ts` (list, get, create, update, remove)
- [ ] Actualizar `src/api/requestApi.ts` (mejorar update())
- [ ] Actualizar `src/api/missionApi.ts` (mejorar update())
- [ ] Validar manejo de errores en todas las APIs

### HOOKS
- [ ] Crear `src/hooks/useSorcerersInCharge.ts`
- [ ] Crear `src/hooks/useInfiniteSorcerersInCharge.ts` (opcional)
- [ ] Actualizar `src/hooks/useRequests.ts` (invalidar caches relacionados)
- [ ] Actualizar `src/hooks/useMissions.ts` (invalidar caches relacionados)
- [ ] Agregar manejo de lastUpdateResponse en QueryClient

### PAGES - CursesPage
- [ ] Agregar colores según estadoActual de Maldición
- [ ] Mostrar indicador visual de estado
- [ ] Mejorar toast al crear con generatedData
- [ ] Agregar navegación a Solicitud

### PAGES - RequestsPage
- [ ] Agregar UI condicional: pendiente
  - [ ] Selector de Hechicero
  - [ ] Selector de NivelUrgencia
  - [ ] Botón "Asignar"
- [ ] Agregar UI condicional: atendiendose
  - [ ] Selector para cambiar Hechicero
  - [ ] Selector para cambiar NivelUrgencia
  - [ ] Botones "Cambiar Hechicero" y "Cambiar Urgencia"
  - [ ] Indicador Caso A vs B
- [ ] Agregar validación de transiciones
- [ ] Mejorar manejo de generatedData
- [ ] Agregar referencia visual a Maldición
- [ ] Agregar referencia visual a Misión

### PAGES - MissionsPage
- [ ] Agregar validación de transiciones de estado
- [ ] Agregar UI para estado Pendiente
  - [ ] Selector de Ubicación
  - [ ] Multi-selector de Hechiceros
  - [ ] Botón "Iniciar Misión"
  - [ ] Validaciones requeridas
- [ ] Agregar UI para estado EnProgreso
  - [ ] Botón "Éxito - Exorcismo"
  - [ ] Botón "Fracaso - Reintentar"
  - [ ] Botón "Cancelar"
  - [ ] Modal de confirmación
- [ ] Agregar UI para estados terminales (solo lectura)
- [ ] Mejorar manejo de generatedData
- [ ] Agregar indicadores visuales de cascada
- [ ] Agregar referencia visual a Solicitud

### TESTING
- [ ] Test flujo completo: Maldición → Solicitud → Misión → Éxito
- [ ] Test flujo con fracaso: Misión → Fracaso → Reintentar
- [ ] Test casos esquinados:
  - [ ] Intentar cambiar sin requisitos
  - [ ] Hechicero no existe
  - [ ] Transición no permitida
- [ ] Test manejo de errores
- [ ] Test UI responsive

---

## 📌 Próximos Pasos

1. **Confirmar Plan**: Revisar con el equipo y stakeholders
2. **Asignar Responsables**: Dev 1, Dev 2, Dev 3, QA
3. **Crear Issues**: Un issue por fase
4. **Sprint Planning**: Distribuir trabajo en sprints
5. **Comenzar FASE 0**: Types (más simple, se puede hacer en paralelo)

---

## 📚 Referencias

- Documentación de API: `FLUJO_CASCADA_DOCUMENTACION.md`
- Backend: Verificar endpoints en `/api/v1` con route map en `client.ts`
- Estado actual de Pages: CursesPage (277 líneas), RequestsPage (237 líneas), MissionsPage (531 líneas)

