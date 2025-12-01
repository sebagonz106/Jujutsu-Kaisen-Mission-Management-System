/**
 * @fileoverview Utility function to truncate text with ellipsis.
 */

/**
 * Truncates text to a maximum length, adding ellipsis if truncated.
 * @param text - The text to truncate
 * @param maxLength - Maximum characters before truncation (default: 50)
 * @returns Truncated text with ellipsis or original text if shorter
 */
export const truncateText = (text: string | undefined | null, maxLength: number = 50): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
};
