'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, UserX, Trash2, AlertTriangle } from 'lucide-react';
import { Avatar, getAvatarColor } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MemberRole } from '@travel-planner/shared';
import type { RoomMemberWithUser } from '@travel-planner/shared';

interface RoomManagePanelProps {
  show: boolean;
  roomName: string;
  members: RoomMemberWithUser[];
  currentUserId: string;
  onClose: () => void;
  onKick: (userId: string) => Promise<void>;
  onDeleteRoom: () => Promise<void>;
}

export function RoomManagePanel({
  show,
  roomName,
  members,
  currentUserId,
  onClose,
  onKick,
  onDeleteRoom,
}: RoomManagePanelProps) {
  const [kickingId, setKickingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleKick(userId: string) {
    setKickingId(userId);
    try {
      await onKick(userId);
    } finally {
      setKickingId(null);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDeleteRoom();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            key="manage-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="manage-panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-background border-l border-border shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Manage</p>
                <h2 className="text-base font-semibold truncate max-w-48">{roomName}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Members list */}
            <div className="flex-1 overflow-y-auto py-3 px-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Members · {members.length}
              </p>
              <div className="space-y-1">
                {members.map((member) => {
                  const isCurrentUser = member.userId === currentUserId;
                  const isAdmin = member.role === MemberRole.ADMIN;
                  const [avatarColor] = getAvatarColor(member.userId);
                  const username = member.user.profile
                    ? `${member.user.profile.firstName} ${member.user.profile.lastName}`
                    : member.user.username;
                  const picture = member.user.profile?.profilePicture ?? '';

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <Avatar
                        src={picture}
                        alt={username}
                        fallback={username}
                        size="sm"
                        ringColor="ring-transparent"
                        pictureColor={avatarColor}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium truncate">{username}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] text-muted-foreground">(you)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {isAdmin && <Crown className="w-3 h-3 text-amber-500" />}
                          <span className={`text-[11px] font-medium ${isAdmin ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            {isAdmin ? 'Admin' : 'Member'}
                          </span>
                        </div>
                      </div>

                      {!isCurrentUser && (
                        <button
                          onClick={() => handleKick(member.userId)}
                          disabled={kickingId === member.userId}
                          title={`Kick ${username}`}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                        >
                          {kickingId === member.userId ? (
                            <span className="w-4 h-4 block border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer - Delete room */}
            <div className="p-4 border-t border-border">
              <Separator className="mb-4" />
              <AnimatePresence mode="wait">
                {!showDeleteConfirm ? (
                  <motion.button
                    key="delete-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete room
                  </motion.button>
                ) : (
                  <motion.div
                    key="delete-confirm"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="space-y-3"
                  >
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span>This will permanently delete <span className="font-semibold text-foreground">{roomName}</span> and all its data.</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 px-3 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-1.5"
                      >
                        {isDeleting ? (
                          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
