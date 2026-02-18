'use client';

import { usersApi, roomsApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import { RoomCard } from "@/components/ui/user/RoomCard";
import type { Room, RoomWithLastMessage } from "@travel-planner/shared";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui";
import { useUserStore } from "@/stores/useUserStore";

function RoomListHeader({ rooms = [] } : { rooms?: RoomWithLastMessage[] }) {
  const { user } = useUserStore();

  return (
    <div className="flex items-center p-8">
      <Avatar src={user?.profile?.profilePicture ?? null} fallback={user?.username?.charAt(0).toUpperCase() ?? "U"}/>
      <div className="flex flex-col justify-center ml-4">
        <p className="font-semibold">{user?.username}</p>
        <div className="flex gap-1">
          <p className="font-bold pt-px">{rooms.length}</p>
          <p className="font-light">groupes de voyage actifs</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [rooms, setRooms] = useState<RoomWithLastMessage[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) ?? null;

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await usersApi.getCurrentUser().getRooms();
        setRooms(res);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Subscribe to socket events for the selected room
  useRoomSocket(selectedRoomId, {
    onRoomUpdated: ({ room }) => {
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, ...room } : r));
    },
    onRoomDeleted: ({ roomId }) => {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (selectedRoomId === roomId) setSelectedRoomId(null);
    },
  });

  return (
    <div className="flex h-screen w-full">
      {/* Left panel - Room list */}
      <div className="flex flex-col">
        <RoomListHeader rooms={rooms} />
        <aside className="w-100">
          {/* {rooms.length > 0 && (
            rooms.map(room => (
              <RoomCard 
                key={room.id}
                id={room.id}
                name={room.name}
                lastMessage={room.lastMessage}
                lastMessageDate={room.lastMessageDate}
                senderUsername={room.senderUsername}
                senderPicture={room.senderPicture}
                onClick={() => setSelectedRoomId(room.id)}
              />
            ))
          )} */}
          <RoomCard 
            key="1"
            id="1"
            name="Room 1"
            lastMessage="Last message in Room 1"
            lastMessageDate={new Date()}
            senderUsername="User1"
            senderPicture={null}
            onClick={() => setSelectedRoomId("1")}
          />
        </aside>
        <Separator orientation="vertical" className="hidden sm:inline" />
      </div>


      {/* Right panel - Room content */}
      <main className="flex-1 flex flex-col">
        
      </main>
    </div>
  );
}
