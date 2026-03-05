import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Format a date for display in room cards:
 * - today → "HH:MM"
 * - this week → "Mon"
 * - older → "DD/MM"
 */
export function formatTime(date: Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  }
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

/**
 * Format a relative time for notifications:
 * e.g. "5s", "3min", "2h", "4j"
 */
export function timeAgo(time: Date | string): string {
  const now = Date.now();
  const created = new Date(time).getTime();
  const seconds = Math.floor((now - created) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

/**
 * Format a date range: "12 jan. → 18 jan. 2025"
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = new Date(start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const e = new Date(end).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${s} → ${e}`;
}

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
