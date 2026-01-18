'use client';

import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/api";
import { roomsApi } from "@/lib/api";
import { Room, User } from "@travel-planner/shared"
import { useEffect, useState } from "react"

function Username({id}: {id: string}) {
  const [name, setName] = useState('');

  useEffect(() => {
    usersApi.getUser(id).getProfile().then(u => setName(u.username));
  })
  return <span>{name}</span>
}

export default function RoomPage() {
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');

  async function getUserInfo(userId: string) : Promise<User> {
    const user = await usersApi.getUser(userId).getProfile();
    return user; 
  }

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const rooms = await usersApi.getMyRooms();
        setRoomList(rooms || []);
      } catch (e) {
        console.error("Fetching room data failed:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Chargement des rooms...</p>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col justify-center">
      <h1 className="text-2xl font-bold mb-4">Mes Rooms</h1>
      <div className="flex gap-4 mb-6">
        <input 
          className="bg-input ring-ring px-4 py-2 rounded border flex-1" 
          type="text" 
          placeholder="Nom de la room"
          value={roomName}
          onChange={(e) => setRoomName(e.currentTarget.value)}
        />
        <input 
          className="bg-input ring-ring px-4 py-2 rounded border flex-1" 
          type="text" 
          placeholder="Desscription de la room"
          value={roomDesc}
          onChange={(e) => setRoomDesc(e.currentTarget.value)}
        />
        <Button onClick={async () => { 

          try {
            const room = await roomsApi.create({ name: roomName, description: roomDesc });
            setRoomList(prev => [...prev, room]);
            setRoomName('');
          } catch (error) {
            console.error('Error creating room:', error);
          }
        }}>
          Créer Room
        </Button>
      </div>
      {roomList.length === 0 ? (
        <p className="text-gray-500">Aucune room trouvée. Créez-en une!</p>
      ) : (
        <div className="grid gap-4">
          {roomList.map((room) => (
            <div key={room.id} className="border p-4 rounded hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{room.name}</h2>
                  {room.description && (
                    <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Admin: <Username id={room.creatorId}/>
                  </p>
                  <span className="text-xs text-gray-400 mt-2 inline-block">
                    Status: {room.status}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(room.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}