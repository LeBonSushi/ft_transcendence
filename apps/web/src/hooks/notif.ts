"use client"

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client';

export function useNotifications() {
    const { user } = useUser();
    const [socket, setSocket] = useState<Socket | null>(null)
    const [notifications, setNotifications] = useState<any[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user?.id) {
            console.log('⏳ En attente de l\'utilisateur...');
            return
        }

        console.log('Utilisateur trouver');
        const newSocket = io("http://localhost:4000", {
            withCredentials: true,
            autoConnect: true
        })
        setSocket(newSocket)
        newSocket.on('connect', () => {
            setIsConnected(true)
            newSocket.emit('subscribetToNotifications', { userId: user?.id })
            newSocket.emit('getUnreadNotifications', { userId: user?.id })
        })
        newSocket.on('disconnect', () => {
            setIsConnected(false)
        })

        newSocket.on('notifications', (notifs) => {
            setNotifications(notifs)
            setLoading(false)
        })
        newSocket.on('newNotifications', (notifs) => {
            setNotifications(prev => [notifs, ...prev])
            setLoading(false)
        })
        return () => {
            newSocket.disconnect()
        }
    }, [user?.id])

    // const refreshNotifications = () => {
    //     if (socket && isConnected && user?.id)
    //     {
    //         setLoading(true)
    //         socket.emit('getNotifications', { userId: user?.id });
    //     }
    // }
    const sendNotif = (notifToSend: any) => {
        if (socket && isConnected && user?.id) {
            setLoading(true)
            socket.emit('sendNotif', { userId: user?.id, notification: notifToSend })
        }
    }
    const readNotification = (notifId: string) => {
        if (socket && isConnected && user?.id) {
            setLoading(true)
            socket.emit('readnotification', { userId: user?.id, notifId: notifId })
        }
    }
    return {
        notifications,
        loading,
        isConnected,
        setNotifications,
        sendNotif,
        readNotification
        // refreshNotifications
    }
}

// voir comment faire pour actulaliser quand nouvelle notif