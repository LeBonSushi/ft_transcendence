'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, X, UserPlus, Users, Trash2, MessageSquare, Mail, Star } from 'lucide-react';
import { NotificationType } from '@travel-planner/shared';
import type { Notification } from '@travel-planner/shared';
import { useNotifications } from '../hooks/notif';
import { timeAgo } from '@/lib/format';

const NOTIF_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  [NotificationType.FRIEND_REQUEST]:  { icon: UserPlus,      color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  [NotificationType.FRIEND_ACCEPTED]: { icon: Users,         color: 'text-green-500',  bg: 'bg-green-500/10' },
  [NotificationType.ROOM_INVITE]:     { icon: Mail,          color: 'text-violet-500', bg: 'bg-violet-500/10' },
  [NotificationType.ROOM_DELETED]:    { icon: Trash2,        color: 'text-red-500',    bg: 'bg-red-500/10' },
  [NotificationType.NEW_MESSAGE]:     { icon: MessageSquare, color: 'text-amber-500',  bg: 'bg-amber-500/10' },
  [NotificationType.WELCOME_MSG]:     { icon: Star,          color: 'text-pink-500',   bg: 'bg-pink-500/10' },
};

const ACTION_TYPES: NotificationType[] = [NotificationType.FRIEND_REQUEST, NotificationType.ROOM_INVITE];

function NotificationItem({
  item,
  index,
  onRead,
  onAnswer,
}: {
  item: Notification;
  index: number;
  onRead: (id: string, index: number) => void;
  onAnswer: (id: string, index: number, accept: boolean) => void;
}) {
  const config = NOTIF_CONFIG[item.type] ?? NOTIF_CONFIG.WELCOME_MSG;
  const Icon = config.icon;
  const hasActions = ACTION_TYPES.includes(item.type);

  return (
    <div className="flex items-start gap-3 px-3 py-3 hover:bg-accent/40 transition-colors group">
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}>
        <Icon size={15} className={config.color} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{item.message}</p>
        {hasActions && (
          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={() => onAnswer(item.id, index, true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors"
            >
              <Check size={11} />
              Accepter
            </button>
            <button
              onClick={() => onAnswer(item.id, index, false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-foreground text-xs font-medium transition-colors"
            >
              <X size={11} />
              Refuser
            </button>
          </div>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(item.createdAt)}</span>
        {!hasActions && (
          <button
            onClick={() => onRead(item.id, index)}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

export function NotificationPannel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, setNotifications, sendNotif: _sendNotif, setReadNotification, answerNotification } = useNotifications();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleRead(id: string, index: number) {
    setReadNotification(id);
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }

  function handleAnswer(id: string, index: number, accept: boolean) {
    answerNotification(id, accept);
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-muted-foreground" />
                <span className="text-sm font-semibold">Notifications</span>
                {notifications.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                    {notifications.length}
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    notifications.forEach(n => setReadNotification(n.id));
                    setNotifications([]);
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Read all
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-border/40">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                  <Bell size={20} className="opacity-30" />
                  <p className="text-xs">Aucune notification</p>
                </div>
              ) : (
                notifications.map((item, index) => (
                  <NotificationItem
                    key={item.id}
                    item={item}
                    index={index}
                    onRead={handleRead}
                    onAnswer={handleAnswer}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
