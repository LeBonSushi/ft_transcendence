'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { useUserStore } from '@/stores/useUserStore';
import { usersApi, roomsApi } from '@/lib/api';
import type { User } from '@travel-planner/shared';
import { Send, X, Loader2 } from 'lucide-react';

export function NewDMModal({ onClose, onCreated }: { onClose: () => void; onCreated: (roomId: string) => void }) {
  const { user } = useUserStore();
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    usersApi.getUserFriends(user.id)
      .then(setFriends)
      .catch(() => setFriends([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  async function handleCreate(friend: User) {
    setCreating(friend.id);
    try {
      const name = friend.profile?.firstName
        ? `${friend.profile.firstName} ${friend.profile.lastName ?? ''}`.trim()
        : friend.username;
      const room = await roomsApi.create({
        name,
        type: 'DIRECT_MESSAGE',
        invitedUserId: friend.id,
      });
      onCreated(room.id);
    } catch { setCreating(null); }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Send size={15} className="text-muted-foreground" />
            <span className="font-semibold text-sm">Nouveau message privé</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-4">
          {loading && <p className="text-xs text-center text-muted-foreground py-6">Chargement…</p>}
          {!loading && friends.length === 0 && (
            <p className="text-xs text-center text-muted-foreground py-6">Aucun ami à contacter.<br/>Ajoute des amis d'abord !</p>
          )}
          {!loading && friends.length > 0 && (
            <ul className="space-y-1.5">
              {friends.map(f => {
                const name = f.profile?.firstName
                  ? `${f.profile.firstName} ${f.profile.lastName ?? ''}`.trim()
                  : f.username;
                const isCreating = creating === f.id;
                return (
                  <li key={f.id}>
                    <button
                      onClick={() => handleCreate(f)}
                      disabled={!!creating}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {(f.profile?.firstName?.[0] ?? f.username[0]).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-[11px] text-muted-foreground">@{f.username}</p>
                      </div>
                      {isCreating
                        ? <Loader2 size={14} className="animate-spin text-muted-foreground shrink-0" />
                        : <Send size={14} className="text-muted-foreground shrink-0" />
                      }
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
