/**
 * @fileoverview Type definitions for mastered cursed techniques (TecnicaMalditaDominada).
 * Matches backend model `TecnicaMalditaDominada`.
 * @module types/masteredTechnique
 */

import type { Sorcerer } from './sorcerer';
import type { Technique } from './technique';

/** Represents a mastered technique (TecnicaMalditaDominada) entity. */
export interface MasteredTechnique {
  /** Unique identifier (backend `Id`). */
  id: number;
  /** Related sorcerer ID (backend `HechiceroId`). */
  hechiceroId: number;
  /** Related sorcerer object (backend `Hechicero`). */
  hechicero?: Sorcerer;
  /** Related technique ID (backend `TecnicaMalditaId`). */
  tecnicaMalditaId: number;
  /** Related technique object (backend `TecnicaMaldita`). */
  tecnicaMaldita?: Technique;
  /** Mastery level 0-100 (backend `NivelDeDominio`). */
  nivelDeDominio: number;
}

/** Payload for creating/updating a mastered technique. */
export interface MasteredTechniquePayload {
  hechiceroId: number;
  tecnicaMalditaId: number;
  nivelDeDominio: number;
}
