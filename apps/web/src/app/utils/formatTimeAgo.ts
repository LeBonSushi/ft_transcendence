import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatTimeAgo(input: string | Date): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) return '';
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}
