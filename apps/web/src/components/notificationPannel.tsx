"use client"

import { useEffect, useState, useRef } from "react"
import { useNotifications } from "../hooks/notif"
import notifLightIcon from "../../public/notiflight.svg"
import notifDarkIcon from "../../public/notifdark.svg"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { useTheme } from "next-themes"
import { Modal } from "./ui"
import { NotificationType } from "@travel-planner/shared"
import { useSession } from "next-auth/react"


function timeAgo(time:any) {
    const now:any = new Date()
    const createdAt:any = new Date(time)
    const seconds = Math.floor((now - createdAt) / 1000) + 1
    if (seconds < 60) {
        return seconds + " sec ago"
    }
    const minutes = Math.floor(seconds / 60)
    if (minutes === 1) {
        return "1 min ago"
    }
    if (minutes < 60) {
        return minutes + " mins ago"
    }
    const hours = Math.floor(minutes / 60)
    if (hours === 1) {
        return "1 hour ago"
    }
    if (hours < 24) {
        return hours + " hours ago"
    }
    const days = Math.floor(hours / 24)
    if (days === 1) {
        return "1 day ago"
    }
    if (days) {
        return days + " days ago"
    }
}

function CloseIcon({ size = 24 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
            <line x1="17" y1="7" x2="7" y2="17" />
            <line x1="7" y1="7" x2="17" y2="17" />
        </svg>
    )
}

export function AcceptIcon({
  size = 20,
  color = "currentColor",
  strokeWidth = 2.5,
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12l6 6 10-12" />
    </svg>
  )
}


export function NotificationPannel() {
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false)
    const { notifications, setNotifications, loading, isConnected, sendNotif, setReadNotification, answerNotification } = useNotifications()
    const panelRef = useRef<HTMLDivElement>(null)
    const { setTheme, theme } = useTheme();
    const { data: session, status } = useSession();
    const user = session?.user
    // setTheme('dark');

    useEffect(() => {
        setMounted(true)
    }, [])
    useEffect(() => {
        function handleClickOutside(event:any) {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsVisible(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => { document.removeEventListener("mousedown", handleClickOutside) }

    }, [panelRef])

    if (!mounted)
    {
        return null
    }
    return (
        <>
        <button className="text-white bg-black w-20 hover:opacity-50 cursor-pointer" 
        onClick={() => sendNotif({toUserId:user?.id!, title:"test",message:"this is a message", type:NotificationType.FRIEND_REQUEST})}>try</button>
            {!isVisible && (
                <>
                    <div className="absolute right-1.5 w-10 h-10 flex justify-center items-center bg-secondary top-1.5 rounded-lg cursor-pointer hover:opacity-70" onClick={() => setIsVisible(true)}>
                        {theme == 'light' && (

                        <Image src={notifLightIcon} alt="notificationLogo" width={20} height={20} />
                        )}
                        {theme == 'dark' && (

                        <Image src={notifDarkIcon} alt="notificationLogo" width={20} height={20} />
                        )}
                    </div>
                </>
            )}
            <AnimatePresence>
                {isVisible && (
                    <>
                        <motion.div
                            ref={panelRef}
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute  w-2/11 max-h-100 bg-secondary border rounded-xl right-3 top-3 overflow-y-auto">
                            {notifications.map((item, index) => (
                                <div
                                    key={index} className="relative flex  h-20   gap-1  items-center flex-row">
                                    <img className="border rounded-full w-10 h-10 ml-3" />
                                    <div className="flex flex-col justify-center h-full">
                                        <p className="text-foreground text-lg font-semibold ml-2">{item.title}</p>
                                        <p className="text-foreground text-base ml-2">{item.message}</p>
                                    </div>
                                    <p className="absolute text-white/50 text-sm ml-2 right-2 top-2">{timeAgo(item.createdAt)}</p>
                                    {(item.type === 'ROOM_DELETED' || item.type === 'NEW_MESSAGE'
                                        || item.type === 'WELCOME_MSG' ||  item.type === "FRIEND_ACCEPTED" && (

                                            <div className="absolute right-3 hover:opacity-70 cursor-pointer"
                                                onClick={() => { setReadNotification(item.id); setNotifications((prev) => prev.filter((_, i) => i !== index)) }}>
                                                <CloseIcon />
                                            </div>
                                        )
                                    )
                                }
                                    {(item.type === 'ROOM_INVITE' || item.type === 'FRIEND_REQUEST' && (
                                            <div className="absolute flex justify-center items-center flex-row right-1 gap-2">
                                            <div className="hover:opacity-70 cursor-pointer"
                                                onClick={() => { answerNotification(item.id, true); setNotifications((prev) => prev.filter((_, i) => i !== index)) }}>
                                                <AcceptIcon />
                                            </div>
                                            <div className="hover:opacity-70 cursor-pointer"
                                                onClick={() => { answerNotification(item.id, false); setNotifications((prev) => prev.filter((_, i) => i !== index)) }}>
                                                <CloseIcon />
                                            </div>
                                            </div>
                                        )
                                    )
                                }

                                </div>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}