'use client';

import { useEffect, useState } from 'react';
import { usersApi, roomsApi } from '@/lib/api';
import { useSocket } from './useSocket';
import { useRoomSocket } from './useRoomSocket';
import { SOCKET_EVENTS } from '@travel-planner/shared';
import type { RoomWithLastMessage, UpdateRoomDto } from '@travel-planner/shared';
import { useUserStore } from '@/stores/useUserStore';

export function useRooms() {
  const [rooms, setRooms] = useState<RoomWithLastMessage[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();
  const { user } = useUserStore();

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) ?? null;

  // Fetch rooms when user is available
  useEffect(() => {
    if (!user?.id) {
      setRooms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    usersApi.getUserRooms(user.id)
      .then(setRooms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Listen for new rooms created in real time
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onRoomCreated = ({ room }: { room: RoomWithLastMessage }) => {
      setRooms(prev => prev.some(r => r.id === room.id) ? prev : [...prev, room]);
    };

    const onRoomInvited = ({ room }: { room: RoomWithLastMessage }) => {
      setRooms(prev => prev.some(r => r.id === room.id) ? prev : [...prev, room]);
    };

    const onMessageReceive = (message: { roomId: string; content: string; createdAt: Date }) => {
      setRooms(prev => prev.map(r => r.id === message.roomId
        ? { ...r, lastMessage: message.content, lastMessageDate: message.createdAt }
        : r
      ));
    };

    const onRoomDeleted = ({ roomId }: { roomId: string }) => {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (selectedRoomId === roomId) setSelectedRoomId(null);
    };

    socket.on(SOCKET_EVENTS.ROOM_CREATED, onRoomCreated);
    socket.on(SOCKET_EVENTS.ROOM_INVITED, onRoomInvited);
    socket.on('message:receive', onMessageReceive);
    socket.on(SOCKET_EVENTS.ROOM_DELETED, onRoomDeleted);
    return () => {
      socket.off(SOCKET_EVENTS.ROOM_CREATED, onRoomCreated);
      socket.off(SOCKET_EVENTS.ROOM_INVITED, onRoomInvited);
      socket.off('message:receive', onMessageReceive);
      socket.off(SOCKET_EVENTS.ROOM_DELETED, onRoomDeleted);
    };
  }, [socket, isConnected, selectedRoomId]);

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
