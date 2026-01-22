"use client"

import {useNotifications} from "../hooks/notif"

export function NotificationPannel() {
    const notif = ["heyyyy", "textttttttttt"]
    const {notifications,loading,isConnected,refreshNotifications} = useNotifications()
    return (
        <>
            <div className="w-100 h-200 bg-white border rounded-xl">
                {notifications.map((item, index) => (
                    <div key={index}> 
                        <p className="text-black text-lg">{item.message}</p>
                    </div>
                ))}
            </div>
        </>
    )
}