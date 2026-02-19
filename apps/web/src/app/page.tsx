'use client';

import { useRooms } from "@/hooks/useRooms";
import { RoomCard } from "@/components/ui/user/RoomCard";
import { Separator } from "@/components/ui/separator";
import { useUserStore } from "@/stores/useUserStore";
import { Profile } from "@/components/ui/user/Profile";
import type { RoomWithLastMessage } from "@travel-planner/shared";

function RoomListHeader({ rooms = [] } : { rooms?: RoomWithLastMessage[] }) {
  const { user } = useUserStore();

  return (
    <div className="flex items-center p-5 ml-3">
      <Profile />
      <div className="flex flex-col justify-center ml-4">
        <div className="flex flex-col ">
          <p className="font-bold text-xl">{user?.profile?.firstName} {user?.profile?.lastName}</p>
          <p className="font-light text-md opacity-50">@{user?.username}</p>
        </div>
        <div className="flex gap-1">
          <p className="font-extrabold pt-px">{rooms.length}</p>
          <p className="font-light">groupes de voyage actifs</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { rooms, selectedRoom, selectRoom, createRoom } = useRooms();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left panel - Room list */}
      <div className="flex flex-col h-full w-100 shrink-0">
        <RoomListHeader rooms={rooms} />
        <aside className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          <button onClick={() => createRoom("Test", "DIRECT_MESSAGE")}>test</button>
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              name={room.name}
              lastMessage={room.lastMessage}
              lastMessageDate={room.lastMessageDate}
              senderUsername={room.senderUsername}
              senderPicture={room.senderPicture}
              isSelected={selectedRoom?.id === room.id}
              onClick={() => selectRoom(room.id)}
            />
          ))}
        </aside>
      </div>
      <Separator orientation="vertical" />

      {/* Right panel - Room content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

      </main>
    </div>
  );
}
