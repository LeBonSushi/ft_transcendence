import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Format a date as relative time (e.g., "il y a 2 heures")
 */
export function formatTimeAgo(input: string | Date): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) return '';
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}

/**
 * Format a date in French locale
 */
export function formatDate(
  input: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', options);
}

/**
 * Format a date with time in French locale
 */
export function formatDateTime(input: string | Date): string {
  return formatDate(input, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a short date (e.g., "12 jan")
 */
export function formatShortDate(input: string | Date): string {
  return formatDate(input, {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Format a short date with time
 */
export function formatShortDateTime(input: string | Date): string {
  return formatDate(input, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
