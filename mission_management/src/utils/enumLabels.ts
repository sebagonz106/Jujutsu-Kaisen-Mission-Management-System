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
export const getSorcererGradeLabel = sorcererGradeLabel;

// Sorcerer status labels
export const sorcererStatusLabel = (value: string): string => {
  const labels = es.enums.sorcerer.status as Record<string, string>;
  return labels[value] ?? value;
};
export const getSorcererStatusLabel = sorcererStatusLabel;

// Curse grade labels
export const curseGradeLabel = (value: string): string => {
  const labels = es.enums.curse.grade as Record<string, string>;
  return labels[value] ?? value;
};
export const getCurseGradeLabel = curseGradeLabel;

// Curse type labels
export const curseTypeLabel = (value: string): string => {
  const labels = es.enums.curse.type as Record<string, string>;
  return labels[value] ?? value;
};
export const getCurseTypeLabel = curseTypeLabel;

// Curse state labels
export const curseStateLabel = (value: string): string => {
  const labels = es.enums.curse.state as Record<string, string>;
  return labels[value] ?? value;
};
export const getCurseStateLabel = curseStateLabel;

// Curse danger level labels
export const curseDangerLabel = (value: string): string => {
  const labels = es.enums.curse.danger as Record<string, string>;
  return labels[value] ?? value;
};
export const getCurseDangerLabel = curseDangerLabel;

// Technique type labels
export const techniqueTypeLabel = (value: string): string => {
  const labels = es.enums.technique.type as Record<string, string>;
  return labels[value] ?? value;
};
export const getTechniqueTypeLabel = techniqueTypeLabel;

// Resource type labels
export const resourceTypeLabel = (value: string): string => {
  const labels = es.enums.resource.type as Record<string, string>;
  return labels[value] ?? value;
};
export const getResourceTypeLabel = resourceTypeLabel;

// Request status labels
export const requestStatusLabel = (value: string): string => {
  const labels = es.enums.request.status as Record<string, string>;
  return labels[value] ?? value;
};
export const getRequestStatusLabel = requestStatusLabel;
