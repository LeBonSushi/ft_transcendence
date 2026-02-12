"use client"

// import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client';
import { useSocket } from './useSocket';
import { useSession } from "next-auth/react";

export function useNotifications() {
    // cosnt 
    // const { user } = useUser();
    const { data: session, status } = useSession();
    const user = session?.user
    const { socket, isConnected } = useSocket()
    // const [socket, setSocket] = useState<Socket | null>(null)
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user ) {
            console.log('⏳ En attente de l\'utilisateur...');
            return
        }
        if (!socket || !isConnected)
        {
            console.log("Problem with socket")
            return
        }
        console.log('User found');
        socket.emit('subscribeToNotifications', { userId: user.id })
        console.log("User subscribed to room")
        socket.emit('getNotifications', { userId: user.id })
        const handleNotif = (notifs: any[]) => {
            // console.log(notifs)
            console.log("New notifs:", notifs)
            setNotifications(notifs)
            setLoading(false)
        }
        const handleNewNotif = (notif: any) => {
            console.log("New notif:", notif)
            setNotifications(prev => [notif, ...prev])
        }
        const handleError = (error: any) => {
            console.error(error)
            setLoading(false)
        }
        socket.onAny((eventName, ...args) => {
            console.log('🎯 ÉVÉNEMENT REÇU:', eventName, args);
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
    const sendNotif = (notifToSend: any) => {
        if (socket && isConnected && user?.id) {
            console.log("Notif sent")
            socket.emit('sendNotif', { userId: user.id, notification: notifToSend })
        }
    }
    const readNotification = (notifId: string) => {
        if (socket && isConnected && user?.id) {
            setLoading(true)
            socket.emit('readnotification', { userId: user?.id, notifId: notifId })
        }
    }
    const answerNotification = (notifId: string, answer: boolean) => {
        if (socket && isConnected && user?.id) {
            setLoading(true)
            socket.emit('answernotification', { userId: user?.id, notifId: notifId, answer: answer })
        }
    }
    return {
        notifications,
        loading,
        isConnected,
        setNotifications,
        sendNotif,
        readNotification,
        answerNotification
        // refreshNotifications
    }
}