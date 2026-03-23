"use client"

import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { useUserStore } from '@/stores/useUserStore';
import { Notification } from '@travel-planner/shared';
import {SOCKET_EVENTS} from '@travel-planner/shared';

export function useNotification() {
    const { user } = useUserStore();
    const { socket, isConnected } = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !socket || !isConnected) return;

        socket.emit(SOCKET_EVENTS.NOTIFICATION_SUBSCRIBE);
        socket.emit(SOCKET_EVENTS.NOTIFICATION_UNREAD);

        const handleNotif = (notifs: Notification[]) => {
            setNotifications(notifs);
            setLoading(false);
        };
        const handleNewNotif = (notif: Notification) => {
            setNotifications(prev => [notif, ...prev]);
        };
        const handleError = (error: unknown) => {
            console.error(error);
            setLoading(false);
        };

        socket.on(SOCKET_EVENTS.NOTIFICATION_UNREAD, handleNotif);
        socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotif);
        return () => {
            socket.off(SOCKET_EVENTS.NOTIFICATION_UNREAD, handleNotif);
            socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotif);
        };
    }, [user?.id, socket, isConnected]);

    const setReadNotification = (notifId: string) => {
        if (socket && isConnected && user?.id) {
            socket.emit(SOCKET_EVENTS.NOTIFICATION_READ, { notifId });
        }
    };
    const answerNotification = (notifId: string, answer: boolean) => {
        if (socket && isConnected && user?.id) {
            socket.emit(SOCKET_EVENTS.NOTIFICATION_ANSWER, { notifId, answer });
        }
    };

    return {
        notifications,
        loading,
        isConnected,
        setNotifications,
        setReadNotification,
        answerNotification,
    };
}
