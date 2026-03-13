'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { useUserStore } from '@/stores/useUserStore';
import { usersApi, roomsApi } from '@/lib/api';
import type { RoomMemberWithUser, RoomWithMembers, User } from '@travel-planner/shared';
import { UserPlus, X, Check, Loader2 } from 'lucide-react';

export function InviteToGroupModal({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const { user } = useUserStore();
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [invited, setInvited] = useState<Record<string, boolean>>({});
  const [inviting, setInviting] = useState<string | null>(null);

  useEffect(() => {
    async function isInvitableFriend() {
      if (!user?.id) {
        setFriends([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [ friendList, roomData] = await Promise.all([
          usersApi.getUserFriends(user.id),
          roomsApi.getRoom(roomId).getMembers(),
        ]);

        const roomUsers = roomData;
        const memberId = new Set(roomUsers.map((u: RoomMemberWithUser) => u.userId));

        const invitables = friendList.filter((f) => !memberId.has(f.id));

        if(invitables)
            setFriends(invitables);
      } catch (error) {
        setFriends([]);
      }
      finally {
        setLoading(false);
      }
    }

    isInvitableFriend();
  }, [user?.id, roomId]);

  async function handleInvite(friendId: string) {
    setInviting(friendId);
    try {
      await roomsApi.getRoom(roomId).inviteUser(friendId);
      setInvited(s => ({ ...s, [friendId]: true }));
    } catch {}
    setInviting(null);
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
            <UserPlus size={15} className="text-muted-foreground" />
            <span className="font-semibold text-sm">Invite friends</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-4">
          {loading && <p className="text-xs text-center text-muted-foreground py-6">Loading...</p>}
          {!loading && friends.length === 0 && (
            <p className="text-xs text-center text-muted-foreground py-6">No friends available to invite</p>
          )}
          {!loading && friends.length > 0 && (
            <ul className="space-y-1.5">
              {friends.map(f => {
                const name = f.profile?.firstName
                  ? `${f.profile.firstName} ${f.profile.lastName ?? ''}`.trim()
                  : f.username;
                const avatarUrl = f.profile?.profilePicture ?? null;
                const isInviting = inviting === f.id;
                const isDone = invited[f.id];
                return (
                  <li key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={name}
                          className="rounded-lg w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-primary">
                          {(f.profile?.firstName?.[0] ?? f.username[0]).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <p className="text-[11px] text-muted-foreground">@{f.username}</p>
                    </div>
                    <button
                      onClick={() => handleInvite(f.id)}
                      disabled={isDone || !!inviting}
                      className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isDone
                          ? 'bg-green-500/10 text-green-600 cursor-default'
                          : 'bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50'
                      }`}
                    >
                      {isInviting
                        ? <Loader2 size={12} className="animate-spin" />
                        : isDone
                          ? <><Check size={12} /> Guest</>
                          : <><UserPlus size={12} /> Invite</>
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
