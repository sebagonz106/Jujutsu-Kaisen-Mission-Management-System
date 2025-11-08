// Mission type aligned with backend Mision.cs but adapted to frontend naming
export const MISSION_STATE = {
  pending: 'pending', // Pendiente
  in_progress: 'in_progress', // EnProgreso
  success: 'success', // CompletadaConExito
  failure: 'failure', // CompletadaConFracaso
  canceled: 'canceled', // Cancelada
} as const;
export type MissionState = typeof MISSION_STATE[keyof typeof MISSION_STATE];

export const MISSION_URGENCY = {
  planned: 'planned', // Planificada
  urgent: 'urgent', // Urgente
  critical: 'critical', // EmergenciaCritica
} as const;
export type MissionUrgency = typeof MISSION_URGENCY[keyof typeof MISSION_URGENCY];

export interface Mission {
  id: number;
  startAt: string; // ISO date string
  endAt?: string; // ISO date string or undefined
  locationId: number;
  state: MissionState;
  events: string;
  collateralDamage: string;
  urgency: MissionUrgency;
  sorcererIds: number[];
  curseIds: number[];
}
