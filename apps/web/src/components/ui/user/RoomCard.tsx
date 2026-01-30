"use client";

import { Avatar } from "@/components/ui/avatar";
import { formatTimeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

interface RoomCardProps {
  name: string;
  lastMessage: string | null;
  senderUsername: string | null;
  senderPicture: string | null;
  lastMessageDate?: string | Date | null;
  onClick?: () => void;
  className?: string;
}

export default function RoomCard({
  name,
  lastMessage,
  senderUsername,
  senderPicture,
  lastMessageDate,
  onClick,
  className,
}: RoomCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "mb-4 bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md hover:border-primary/20 cursor-pointer",
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Open room ${name}`}
    >
      <div className="p-3">
        <div className="flex gap-3 items-center">
          <Avatar
            src={senderPicture}
            alt={senderUsername || "Unknown"}
            fallback={senderUsername || undefined}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-foreground flex-1 truncate">
                {name}
              </h3>
              {lastMessageDate != null && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimeAgo(lastMessageDate)}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground truncate mb-1">
              {lastMessage || "Pas de messages"}
            </p>

            {senderUsername && (
              <span className="text-xs font-semibold text-foreground">
                {senderUsername}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact variant for sidebars
interface RoomCardCompactProps {
  name: string;
  description?: string | null;
  status?: string;
  memberCount?: number;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function RoomCardCompact({
  name,
  description,
  status,
  memberCount,
  onClick,
  isActive,
  className,
}: RoomCardCompactProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "p-3 rounded-lg border transition-all cursor-pointer",
        isActive
          ? "bg-primary/5 border-primary/20"
          : "bg-card border-border hover:border-primary/20 hover:shadow-sm",
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Open room ${name}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {description}
            </p>
          )}
        </div>
        {status && (
          <StatusBadge status={status} />
        )}
      </div>
      {memberCount !== undefined && (
        <p className="text-xs text-muted-foreground mt-2">
          {memberCount} membre{memberCount > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    PLANNING: "bg-yellow-500/10 text-yellow-600",
    CONFIRMED: "bg-green-500/10 text-green-600",
    COMPLETED: "bg-blue-500/10 text-blue-600",
  };

  const statusLabels: Record<string, string> = {
    PLANNING: "Planification",
    CONFIRMED: "Confirmé",
    COMPLETED: "Terminé",
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 text-xs font-medium rounded-full shrink-0",
        statusStyles[status] || "bg-muted text-muted-foreground"
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
