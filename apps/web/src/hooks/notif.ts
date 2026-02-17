"use client"

import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { useSession } from "next-auth/react";
import { CreateNotificationDto, Notification } from '@travel-planner/shared';

export function useNotifications() {
    const { data: session, status } = useSession();
    const user = session?.user
    const { socket, isConnected } = useSocket()
    // const [socket, setSocket] = useState<Socket | null>(null)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user ) {
            console.log('⏳ En attente de l\'utilisateur...');
            return
        }
        if (!socket || !isConnected)
            return
        socket.emit('subscribeToNotifications')
        socket.emit('getUnreadNotifications')
        const handleNotif = (notifs: Notification[]) => {
            console.log("New notifs:", notifs)
            setNotifications(notifs)
            setLoading(false)
        }
        const handleNewNotif = (notif: Notification) => {
            console.log("New notif:", notif)
            setNotifications(prev => [notif, ...prev])
        }
        const handleError = (error: unknown) => {
            console.error(error)
            setLoading(false)
        }
        socket.onAny((eventName, ...args) => {
            console.log('ÉVÉNEMENT REÇU:', eventName, args);
        });
        socket.on('notifications', handleNotif)
        // socket.on('getNotifications', handleNotif)
        socket.on('newNotification', handleNewNotif)
        socket.on('error', handleError)
        return () => {
            socket.off('notifications', handleNotif);
            socket.off('newNotification', handleNewNotif);
            socket.off('error', handleError);
        }
    }, [user?.id, socket, isConnected])

    // const refreshNotifications = () => {
    //     if (socket && isConnected && user?.id)
    //     {
    //         setLoading(true)
    //         socket.emit('getNotifications', { userId: user?.id });
    //     }
    // }
    const sendNotif = (notification: CreateNotificationDto) => {
        if (socket && isConnected && user?.id) {
            // console.log("Notif sent to", targetUserId)
            socket.emit('sendNotif', { notification })
        }
    }
    const setReadNotification = (notifId: string) => {
        if (socket && isConnected && user?.id) {
            setLoading(true)
            socket.emit('readnotification', { notifId })
        }
    }
    const answerNotification = (notifId: string, answer: boolean) => {
        if (socket && isConnected && user?.id) {
            setLoading(true)
            socket.emit('answernotification', { notifId, answer })
        }
    }
    return {
        notifications,
        loading,
        isConnected,
        setNotifications,
        sendNotif,
        setReadNotification,
        answerNotification
    }
}