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

  // Subscribe to all user rooms so we receive kicked/deleted events for non-selected rooms
  useEffect(() => {
    if (!socket || !isConnected || rooms.length === 0) return;
    rooms.forEach(r => socket.emit(SOCKET_EVENTS.ROOM_SUBSCRIBE, { roomId: r.id }));
  }, [socket, isConnected, rooms]);

  // Listen for new rooms created in real time
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onRoomCreated = ({ room }: { room: RoomWithLastMessage }) => {
      setRooms(prev => prev.some(r => r.id === room.id) ? prev : [...prev, room]);
    };

    const onRoomInvited = ({ room }: { room: RoomWithLastMessage }) => {
      setRooms(prev => prev.some(r => r.id === room.id) ? prev : [...prev, room]);
    };

    const onMessageReceive = (message: { roomId: string; content: string; createdAt: Date; type?: 'TEXT' | 'IMAGE' | 'SYSTEM'; attachmentUrl?: string | null }) => {
      const isImageMessage = message.type === 'IMAGE' || !!message.attachmentUrl;

      setRooms(prev => prev.map(r => r.id === message.roomId
        ? { ...r, lastMessage: isImageMessage ? 'Image' : (message.content ?? ''), lastMessageDate: message.createdAt }
        : r
      ));
    };

    const onRoomDeleted = ({ roomId }: { roomId: string }) => {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (selectedRoomId === roomId)
        setSelectedRoomId(null);
    };

    const onMemberKicked = ({ userId, roomId }: { userId: string; roomId: string }) => {
      if (userId === user?.id) {
        setRooms(prev => prev.filter(r => r.id !== roomId));
        if (selectedRoomId === roomId) setSelectedRoomId(null);
      }
    };

    const onMemberLeft = ({ userId, roomId }: { userId: string; roomId: string }) => {
      if (userId === user?.id) {
        setRooms(prev => prev.filter(r => r.id !== roomId));
        if (selectedRoomId === roomId) setSelectedRoomId(null);
      }
    };

    socket.on(SOCKET_EVENTS.ROOM_CREATED, onRoomCreated);
    socket.on(SOCKET_EVENTS.ROOM_INVITED, onRoomInvited);
    socket.on(SOCKET_EVENTS.ROOM_LAST_MESSAGE_UPDATED, onMessageReceive);
    socket.on(SOCKET_EVENTS.ROOM_DELETED, onRoomDeleted);
    socket.on(SOCKET_EVENTS.MEMBER_KICKED, onMemberKicked);
    socket.on(SOCKET_EVENTS.MEMBER_LEFT, onMemberLeft);
    return () => {
      socket.off(SOCKET_EVENTS.ROOM_CREATED, onRoomCreated);
      socket.off(SOCKET_EVENTS.ROOM_INVITED, onRoomInvited);
      socket.off(SOCKET_EVENTS.ROOM_LAST_MESSAGE_UPDATED, onMessageReceive);
      socket.off(SOCKET_EVENTS.ROOM_DELETED, onRoomDeleted);
      socket.off(SOCKET_EVENTS.MEMBER_KICKED, onMemberKicked);
      socket.off(SOCKET_EVENTS.MEMBER_LEFT, onMemberLeft);
    };
  }, [socket, isConnected, selectedRoomId, user?.id]);

  // Subscribe to socket events for the selected room
  useRoomSocket(selectedRoomId, {
    onRoomUpdated: ({ room }) => {
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, ...room } : r));
    },
    onRoomDeleted: ({ roomId }) => {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (selectedRoomId === roomId) setSelectedRoomId(null);
    },
    onMemberLeft: ({ userId }) => {
      if (userId === user?.id) {
        setRooms(prev => prev.filter(r => r.id !== selectedRoomId));
        setSelectedRoomId(null);
      }
    },
    onMemberKicked: ({ userId }) => {
      if (userId === user?.id) {
        setRooms(prev => prev.filter(r => r.id !== selectedRoomId));
        setSelectedRoomId(null);
      }
    },
  });

  const updateRoom = async (roomId: string, data: UpdateRoomDto) => {
    return roomsApi.getRoom(roomId).update(data);
  };

  const deleteRoom = async (roomId: string) => {
    return roomsApi.getRoom(roomId).delete();
  };

  const leaveRoom = async (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
    setSelectedRoomId(null);
    return roomsApi.getRoom(roomId).leave();
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
    deleteRoom,
    leaveRoom,
  };
}
