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
            autoConnect:true
        })
        setSocket(newSocket)
        newSocket.on('connect', () => {
            setIsConnected(true)
            newSocket.emit('getNotifications', {userId: user?.id})
        })

        newSocket.on('disconnect', () => {
            setIsConnected(false)
        })

        newSocket.on('notifications', (notifs)=>{
            setNotifications(notifs)
            setLoading(false)
        })
        return () => {
            newSocket.disconnect()
        } 
    },[user?.id])

    // const refreshNotifications = () => {
    //     if (socket && isConnected && user?.id)
    //     {
    //         setLoading(true)
    //         socket.emit('getNotifications', { userId: user?.id });
    //     }
    // }
    return {
        notifications,
        loading,
        isConnected,
        // refreshNotifications
    }
}

// voir comment faire pour actulaliser quand nouvelle notif