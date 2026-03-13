import { Avatar, getAvatarColor } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/format";

interface RoomCardProps {
  id: string;
  name: string;
  lastMessage: string | null;
  lastMessageDate: Date | null;
  senderUsername: string | null;
  roomPicture: string | null;
  createdAt?: Date;
  isSelected?: boolean;
  onClick?: () => void;
}

export function RoomCard({ id, name, lastMessage, lastMessageDate, senderUsername, roomPicture, isSelected, onClick }: RoomCardProps) {
  const [roomColor] = getAvatarColor(id);
  const isAttachmentUrl = (value: string | null) => {
    if (!value) return false;
    return /\/message-attachments\//i.test(value)
      || /^https?:\/\/.+\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(value);
  };
  const previewMessage = isAttachmentUrl(lastMessage) ? 'Image' : lastMessage;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors rounded-lg",
        isSelected ? "bg-accent/60" : "hover:bg-muted/70"
      )}
    >
      <Avatar
        src={roomPicture ?? ''}
        alt={name}
        fallback={name}
        size="sm"
        ringColor="ring-transparent"
        pictureColor={roomColor}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-sm text-foreground truncate">{name}</span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatTime(lastMessageDate)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {previewMessage
            ? <>{senderUsername && <span className="font-medium text-foreground/70">{senderUsername} : </span>}{previewMessage}</>
            : <span className="italic opacity-60">No messages</span>
          }
        </p>
      </div>
    </button>
  );
}
