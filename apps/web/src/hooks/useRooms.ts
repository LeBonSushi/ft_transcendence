'use client';

import { useEffect, useState } from 'react';
import { usersApi, roomsApi } from '@/lib/api';
import { useSocket } from './useSocket';
import { useRoomSocket } from './useRoomSocket';
import { SOCKET_EVENTS } from '@travel-planner/shared';
import type { RoomWithLastMessage, UpdateRoomDto } from '@travel-planner/shared';

export function useRooms() {
  const [rooms, setRooms] = useState<RoomWithLastMessage[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) ?? null;

  // Fetch rooms on mount
  useEffect(() => {
    usersApi.getCurrentUser().getRooms()
      .then(setRooms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Listen for new rooms created in real time
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handler = ({ room }: { room: RoomWithLastMessage }) => {
      setRooms(prev => prev.some(r => r.id === room.id) ? prev : [...prev, room]);
    };

    socket.on(SOCKET_EVENTS.ROOM_CREATED, handler);
    return () => { socket.off(SOCKET_EVENTS.ROOM_CREATED, handler); };
  }, [socket, isConnected]);

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

  const updateRoom = async (roomId: string, data: UpdateRoomDto) => {
    return roomsApi.getRoom(roomId).update(data);
  };

  const createRoom = async (name: string, type: 'DIRECT_MESSAGE' | 'GROUP') => {
    return roomsApi.create({ name, type });
  };

  return {
    rooms,
    selectedRoom,
    selectedRoomId,
    loading,
    selectRoom: setSelectedRoomId,
    createRoom,
    updateRoom,
  };
}
