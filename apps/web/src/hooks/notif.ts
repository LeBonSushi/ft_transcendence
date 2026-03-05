"use client"

import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { useUserStore } from '@/stores/useUserStore';
import { CreateNotificationDto, Notification } from '@travel-planner/shared';

export function useNotifications() {
    const { user } = useUserStore();
    const { socket, isConnected } = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !socket || !isConnected) return;

        socket.emit('subscribeToNotifications');
        socket.emit('getUnreadNotifications');

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

        socket.on('notifications', handleNotif);
        socket.on('newNotification', handleNewNotif);
        socket.on('error', handleError);
        return () => {
            socket.off('notifications', handleNotif);
            socket.off('newNotification', handleNewNotif);
            socket.off('error', handleError);
        };
    }, [user?.id, socket, isConnected]);

    const sendNotif = (notification: CreateNotificationDto) => {
        if (socket && isConnected && user?.id) {
            socket.emit('sendNotif', { notification });
        }
    };
    const setReadNotification = (notifId: string) => {
        if (socket && isConnected && user?.id) {
            socket.emit('readnotification', { notifId });
        }
    };
    const answerNotification = (notifId: string, answer: boolean) => {
        if (socket && isConnected && user?.id) {
            socket.emit('answernotification', { notifId, answer });
        }
    };

    return {
        notifications,
        loading,
        isConnected,
        setNotifications,
        sendNotif,
        setReadNotification,
        answerNotification,
    };
}
