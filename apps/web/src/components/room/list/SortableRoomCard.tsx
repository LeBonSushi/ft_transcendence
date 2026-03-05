'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RoomCard } from '@/components/ui/user/RoomCard';
import type { RoomWithLastMessage } from '@travel-planner/shared';

export function SortableRoomCard({ room, isSelected, onClick }: {
  room: RoomWithLastMessage;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: room.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
      {...listeners}
    >
      <RoomCard
        id={room.id}
        name={room.name}
        lastMessage={room.lastMessage}
        lastMessageDate={room.lastMessageDate}
        senderUsername={room.senderUsername}
        roomPicture={room.imageUrl}
        isSelected={isSelected}
        onClick={onClick}
      />
    </div>
  );
}
