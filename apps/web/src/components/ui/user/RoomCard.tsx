import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface RoomCardProps {
  key: string;
  id: string;
  name: string;
  lastMessage: string | null;
  lastMessageDate: Date | null;
  senderUsername: string | null;
  senderPicture: string | null;
  createdAt?: Date;
  isSelected?: boolean;
  onClick?: () => void;
}

function formatTime(date: Date | null): string {
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

export function RoomCard({ name, lastMessage, lastMessageDate, senderUsername, senderPicture, isSelected, onClick }: RoomCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors rounded-lg",
        isSelected ? "bg-accent/60" : "hover:bg-muted/70"
      )}
    >
      <Avatar
        src={senderPicture ?? ''}
        alt={name}
        fallback={name}
        size="sm"
        ringColor="ring-transparent"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-sm text-foreground truncate">{name}</span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatTime(lastMessageDate)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {lastMessage
            ? <>{senderUsername && <span className="font-medium text-foreground/70">{senderUsername} : </span>}{lastMessage}</>
            : <span className="italic opacity-60">Aucun message</span>
          }
        </p>
      </div>
    </button>
  );
}
