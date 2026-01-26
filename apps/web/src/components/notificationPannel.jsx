"use client"

import { useState } from "react"
import { useNotifications } from "../hooks/notif"

export function NotificationPannel() {
    const notif = ["heyyyy", "textttttttttt"]
    const [isVisible, setIsVisible] = useState(false)
    const { notifications, loading, isConnected, refreshNotifications, sendNotif } = useNotifications()
    return (
        <>
                {/* <div>
                    <button className="border text-black cursor-pointer hover:opacity-70" 
                    onClick={() => sendNotif({title:"couocu", message:"messss", type:"TEXT_EXEMPLE"})}>
                    Create
                    </button>
                    </div> */}
                {!isVisible && (
                    <>
                    <div className="absolute right-1.5 w-10 h-10 bg-white top-1.5 rounded-lg " onClick={() => setIsVisible(true)}>

                    </div>
                    </>
                )}
                {isVisible && (
                    <>
                    <div className="absolute  w-100 h-150 bg-white border rounded-xl right-3 top-3">
                        {notifications.map((item, index) => (
                            <div key={index} className="relative flex  h-20   gap-1  items-center flex-row">
                                <img className="border rounded-full w-10 h-10 ml-3" />
                                <div className="flex flex-col justify-center h-full">
                                    <p className="text-black text-lg font-semibold ml-2">{item.title}</p>
                                    <p className="text-black text-lg ml-2">{item.message}</p>
                                    <p className="absolute text-gray-500 text-sm ml-2 right-2 top-2">2 min ago</p>
                                </div>
                            </div>
                        ))}
            </div>
                    </>
                )}
        </>
    )
}