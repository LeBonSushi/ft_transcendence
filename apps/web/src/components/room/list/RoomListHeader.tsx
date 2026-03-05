'use client';

import { Profile } from '@/components/ui/user/Profile';
import { NotificationPannel } from '@/components/notificationPannel';
import { useUserStore } from '@/stores/useUserStore';
import type { RoomWithLastMessage } from '@travel-planner/shared';
import { UserPlus } from 'lucide-react';

export function RoomListHeader({ rooms = [], onAddFriend }: { rooms?: RoomWithLastMessage[], onAddFriend: () => void }) {
  const { user } = useUserStore();

  return (
    <div className="flex items-center p-4 ml-3">
      <Profile />
      <div className="flex flex-col justify-center ml-4 flex-1">
        <div className="flex flex-col ">
          <p className="font-bold text-xl">{user?.profile?.firstName} {user?.profile?.lastName}</p>
          <p className="font-light text-md opacity-50">@{user?.username}</p>
        </div>
        <div className="flex gap-1">
          <p className="font-extrabold pt-px">{rooms.filter(room => room.type === 'GROUP').length}</p>
          <p className="font-light">groupes de voyage actifs</p>
        </div>
      </div>
      <div className="flex items-center gap-1 mr-1">
        <button
          onClick={onAddFriend}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Ajouter un ami"
        >
          <UserPlus size={18} />
        </button>
        <NotificationPannel />
      </div>
    </div>
  );
}
