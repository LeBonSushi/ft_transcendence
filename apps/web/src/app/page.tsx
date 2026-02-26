'use client';

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRooms } from "@/hooks/useRooms";
import { RoomCard } from "@/components/ui/user/RoomCard";
import { Separator } from "@/components/ui/separator";
import { useUserStore } from "@/stores/useUserStore";
import { Profile } from "@/components/ui/user/Profile";
import type { RoomWithLastMessage } from "@travel-planner/shared";
import { Paperclip, Send } from "lucide-react";

function RoomListHeader({ rooms = [] } : { rooms?: RoomWithLastMessage[] }) {
  const { user } = useUserStore();

  return (
    <div className="flex items-center p-4 ml-3">
      <Profile />
      <div className="flex flex-col justify-center ml-4">
        <div className="flex flex-col ">
          <p className="font-bold text-xl">{user?.profile?.firstName} {user?.profile?.lastName}</p>
          <p className="font-light text-md opacity-50">@{user?.username}</p>
        </div>
        <div className="flex gap-1">
          <p className="font-extrabold pt-px">{rooms.filter(room => room.type === 'GROUP').length}</p>
          <p className="font-light">groupes de voyage actifs</p>
        </div>
      </div>
    </div>
  );
}

function NamedSeparator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 px-2 py-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{name}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

export default function Home() {
  const { rooms, selectedRoom, selectRoom, updateRoom, createRoom } = useRooms();
  const [roomName, setRoomName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isHoveringName, setIsHoveringName] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const imagesToUpload = useRef<Record<string, File[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isMaxMessageSizeExceeded, setIsMaxMessageSizeExceeded] = useState(false);

  const MAX_ROOM_NAME_LENGTH = 30;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_IMAGES_PER_MESSAGE = 5;
  const MAX_MESSAGE_SIZE = 2000; // 2000 characters

  useEffect(() => {
    setRoomName(selectedRoom?.name ?? '');
    setIsEditingName(false);
  }, [selectedRoom?.id]);

  const groupRooms = useMemo(() => rooms.filter(r => r.type === 'GROUP'), [rooms]);
  const dmRooms = useMemo(() => rooms.filter(r => r.type === 'DIRECT_MESSAGE'), [rooms]);

  function handleSelectRoom(id: string) {
    selectRoom(id);
    setMobileView('chat');
  }

  function handleBack() {
    setMobileView('list');
    selectRoom(null);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* Left panel - Room list */}
      <div className={`
        flex flex-col h-full shrink-0
        w-full md:w-100
        ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
      `}>
        <RoomListHeader rooms={rooms} />
        <NamedSeparator name="Groupes de voyage" />
        <aside className="flex-1 overflow-y-auto py-1 space-y-0.5">
          <div className="px-2">
            {groupRooms.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Aucun groupe de voyage disponible</p>
            )}
            {groupRooms.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                name={room.name}
                lastMessage={room.lastMessage}
                lastMessageDate={room.lastMessageDate}
                senderUsername={room.senderUsername}
                senderPicture={room.senderPicture}
                isSelected={selectedRoom?.id === room.id}
                onClick={() => handleSelectRoom(room.id)}
              />
            ))}
          </div>
          <NamedSeparator name="Messages privés" />
          <div className="px-2">
            {dmRooms.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Aucun message privé disponible</p>
            )}
            {dmRooms.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                name={room.name}
                lastMessage={room.lastMessage}
                lastMessageDate={room.lastMessageDate}
                senderUsername={room.senderUsername}
                senderPicture={room.senderPicture}
                isSelected={selectedRoom?.id === room.id}
                onClick={() => handleSelectRoom(room.id)}
              />
            ))}
          </div>
        </aside>
      </div>

      <Separator orientation="vertical" className="hidden md:block" />

      {/* Right panel - Room content */}
      <main className={`
        flex-1 flex flex-col h-full overflow-hidden
        ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
      `}>
        {selectedRoom ? (
          <>
            <div className="flex flex-col px-4 md:px-8 py-5 border-b border-border/60">
              {/* Bouton retour mobile */}
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3 md:hidden w-fit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Retour
              </button>

              <AnimatePresence mode="wait" initial={false}>
                {isEditingName ? (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, y: 4 }}
                    animate={isShaking ? { opacity: 1, y: 0, x: [0, -6, 6, -6, 6, -4, 4, 0] } : { opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={isShaking ? { duration: 0.4, ease: "easeInOut" } : { duration: 0.15 }}
                  >
                    <input
                      autoFocus
                      spellCheck={false}
                      value={roomName}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_ROOM_NAME_LENGTH) {
                          setRoomName(e.target.value);
                        } else if (!isShaking) {
                          setIsShaking(true);
                          setTimeout(() => setIsShaking(false), 500);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const trimmed = roomName.trim();
                          if (!trimmed) setRoomName(selectedRoom.name);
                          else updateRoom(selectedRoom.id, { name: trimmed });
                          setIsEditingName(false);
                        }
                        if (e.key === 'Escape') {
                          setRoomName(selectedRoom.name);
                          setIsEditingName(false);
                        }
                      }}
                      onBlur={() => {
                        setRoomName(selectedRoom.name);
                        setIsEditingName(false);
                      }}
                      style={{ fontFamily: 'var(--font-serif)' }}
                      className="w-full max-w-xs text-2xl font-semibold tracking-tight text-foreground outline-none bg-muted/50 border border-primary/40 rounded-md px-3 py-1"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-start"
                  >
                    <motion.button
                      onClick={() => setIsEditingName(true)}
                      onHoverStart={() => setIsHoveringName(true)}
                      onHoverEnd={() => setIsHoveringName(false)}
                      className="flex items-center gap-2 -mx-3 px-3 py-1 rounded-md"
                    >
                      <motion.span
                        style={{ fontFamily: 'var(--font-serif)', originX: 0 }}
                        className="text-2xl font-semibold tracking-tight"
                        animate={isHoveringName ? { color: 'var(--primary)', scale: 1.02 } : { color: 'var(--foreground)', scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {roomName}
                      </motion.span>
                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14" height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0"
                        animate={isHoveringName ? { color: 'var(--primary)' } : { color: 'var(--muted-foreground)' }}
                        transition={{ duration: 0.2 }}
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      </motion.svg>
                    </motion.button>
                    <motion.span
                      className="text-xs text-muted-foreground/50 font-sans whitespace-nowrap"
                      animate={isHoveringName ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden', display: 'block' }}
                    >
                      Cliquer pour renommer · Entrée pour sauvegarder
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">
              {/* Zone messages */}
            </div>
            <motion.div
              animate={isMaxMessageSizeExceeded ? { x: [0, -4, 4, -4, 4, -2, 2, 0] } : { x: 0 }}
              className="flex items-end gap-4 mx-5 mb-8 px-5 py-3 rounded-3xl bg-muted border border-border">
              <motion.button
                className="shrink-0 w-5 h-5 mb-0.5"
                whileHover={{ scale: 1.1, color: 'var(--primary)' }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                      if (files.length + (imagesToUpload.current[selectedRoom.id]?.length || 0) > MAX_IMAGES_PER_MESSAGE) {
                        setError(`Vous ne pouvez pas envoyer plus de ${MAX_IMAGES_PER_MESSAGE} images par message.`);
                        return;
                      }
                      for (let i = 0; i < files.length; i++) {
                        if (files[i].size > MAX_IMAGE_SIZE) {
                          setError(`Un ou plusieurs fichiers sont trop volumineux.`);
                          return;
                        } else {
                          imagesToUpload.current[selectedRoom.id] = imagesToUpload.current[selectedRoom.id] || [];
                          imagesToUpload.current[selectedRoom.id].push(files[i]);
                        }
                      }
                    }
                  };
                  input.click();
                }}
              >
                <Paperclip className="w-full h-full" />
              </motion.button>
              <textarea
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    console.log('Envoyer message :', e.currentTarget.value);
                  }
                }}
                onChange={(e) => {
                  if (e.target.value.length > MAX_MESSAGE_SIZE) {
                    e.target.value = e.target.value.slice(0, MAX_MESSAGE_SIZE);
                    setIsMaxMessageSizeExceeded(true);
                    setTimeout(() => setIsMaxMessageSizeExceeded(false), 500);
                  }
                }}
                className="w-full max-h-40 outline-none bg-transparent resize-none field-sizing-content leading-relaxed text-sm placeholder:text-muted-foreground"
                placeholder="Écrivez votre message..."
              />
              <motion.button
                className="shrink-0 w-5 h-5 mb-0.5"
                whileHover={{ scale: 1.1, color: 'var(--primary)' }}
                transition={{ duration: 0.2 }}
                onClick={() => console.log('Envoyer message')}
              >
                <Send className="w-full h-full" />
              </motion.button>
            </motion.div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Sélectionnez une conversation pour commencer à discuter</p>
          </div>
        )}
      </main>
    </div>
  );
}
