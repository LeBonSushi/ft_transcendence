'use client';

import { RoomCard } from '@/components/ui/user/RoomCard';
import { RoomListHeader } from './RoomListHeader';  
import { SortableRoomCard } from './SortableRoomCard';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { RoomWithLastMessage } from '@travel-planner/shared';
import { Plus } from 'lucide-react';

interface RoomListPanelProps {
  rooms: RoomWithLastMessage[];
  groupRooms: RoomWithLastMessage[];
  dmRooms: RoomWithLastMessage[];
  selectedRoomId: string | null;
  mobileView: 'list' | 'chat';
  onSelectRoom: (id: string) => void;
  onAddFriend: () => void;
  onNewGroup: () => void;
  onNewDM: () => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export function RoomListPanel({
  rooms,
  groupRooms,
  dmRooms,
  selectedRoomId,
  mobileView,
  onSelectRoom,
  onAddFriend,
  onNewGroup,
  onNewDM,
  onDragEnd,
}: RoomListPanelProps) {
  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  return (
    <div className={`
      flex flex-col h-full shrink-0
      w-full md:w-100
      ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
    `}>
      <RoomListHeader rooms={rooms} onAddFriend={onAddFriend} />
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Groupes de voyage</span>
        <div className="h-px flex-1 bg-border" />
        <button
          onClick={onNewGroup}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Nouveau groupe"
        >
          <Plus size={13} />
        </button>
      </div>
      <aside className="flex-1 overflow-y-auto py-1 space-y-0.5">
        <div className="px-2">
          {groupRooms.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Aucun groupe de voyage disponible</p>
          )}
          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
            <SortableContext items={groupRooms.map(r => r.id)} strategy={verticalListSortingStrategy}>
              {groupRooms.map((room) => (
                <SortableRoomCard
                  key={room.id}
                  room={room}
                  isSelected={selectedRoomId === room.id}
                  onClick={() => onSelectRoom(room.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Messages privés</span>
          <div className="h-px flex-1 bg-border" />
          <button
            onClick={onNewDM}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Nouveau message privé"
          >
            <Plus size={13} />
          </button>
        </div>
        <div className="px-2">
          {dmRooms.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Aucun message privé disponible</p>
          )}
          {dmRooms.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              name={room.name}
              lastMessage={room.lastMessage}
              lastMessageDate={room.lastMessageDate}
              senderUsername={room.senderUsername}
              roomPicture={room.imageUrl}
              isSelected={selectedRoomId === room.id}
              onClick={() => onSelectRoom(room.id)}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}
