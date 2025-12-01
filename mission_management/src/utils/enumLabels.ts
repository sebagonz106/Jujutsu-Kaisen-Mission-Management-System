/**
 * @fileoverview Helper functions to get user-friendly labels for enum values.
 * Maps internal enum values to localized display labels.
 */

import { es } from '../i18n/es';

// Sorcerer grade labels
export const sorcererGradeLabel = (value: string): string => {
  const labels = es.enums.sorcerer.grade as Record<string, string>;
  return labels[value] ?? value;
};

// Sorcerer status labels
export const sorcererStatusLabel = (value: string): string => {
  const labels = es.enums.sorcerer.status as Record<string, string>;
  return labels[value] ?? value;
};

// Curse grade labels
export const curseGradeLabel = (value: string): string => {
  const labels = es.enums.curse.grade as Record<string, string>;
  return labels[value] ?? value;
};

// Curse type labels
export const curseTypeLabel = (value: string): string => {
  const labels = es.enums.curse.type as Record<string, string>;
  return labels[value] ?? value;
};

// Curse state labels
export const curseStateLabel = (value: string): string => {
  const labels = es.enums.curse.state as Record<string, string>;
  return labels[value] ?? value;
};

// Curse danger level labels
export const curseDangerLabel = (value: string): string => {
  const labels = es.enums.curse.danger as Record<string, string>;
  return labels[value] ?? value;
};

// Technique type labels
export const techniqueTypeLabel = (value: string): string => {
  const labels = es.enums.technique.type as Record<string, string>;
  return labels[value] ?? value;
};
