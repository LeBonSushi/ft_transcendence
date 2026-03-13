'use client';

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRooms } from "@/hooks/useRooms";
import { useMessages } from "@/hooks/useMessages";
import { usePlanning } from "@/hooks/usePlanning";
import { useUserStore } from "@/stores/useUserStore";
import { storageApi, roomsApi } from "@/lib/api";
import { scoreProposals } from "@/lib/proposalScoring";
import type { Message, ActivityCategory } from "@travel-planner/shared";
import { MemberRole } from "@travel-planner/shared";
import { Camera, Paperclip, Send, LayoutPanelLeft, UserPlus, Settings2, LogOut } from "lucide-react";
import { Avatar, getAvatarColor } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';

// Modals
import { AddFriendModal, NewDMModal, NewGroupModal, InviteToGroupModal } from "@/components/room/modals";
// List components
import { RoomListPanel } from "@/components/room/list";
// Chat components
import { MessageItem } from "@/components/room/chat";
// Planning components
import { PlanningPanel } from "@/components/room/planning";
// Manage panel
import { RoomManagePanel } from "@/components/room/manage/RoomManagePanel";

const GROUP_TIME_THRESHOLD_MS = 5 * 60 * 1000;

export default function Home() {
  const { rooms, selectedRoom, selectRoom, updateRoom, deleteRoom, leaveRoom } = useRooms();
  const { messages, sendMessage } = useMessages(selectedRoom?.id ?? null);
  const {
    proposals, availabilities, matchingDate, matchingDateMessage, members, loadingProposals,
    createProposal, deleteProposal, selectProposal,
    vote, removeVote,
    createActivity, deleteActivity,
    createAvailability, deleteAvailability,
  } = usePlanning(selectedRoom?.id ?? null, selectedRoom?.type ?? null);
  const { user } = useUserStore();

  const [roomName, setRoomName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isHoveringName, setIsHoveringName] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [planningTab, setPlanningTab] = useState<'proposals' | 'availabilities'>('proposals');
  const [showPlanningPanel, setShowPlanningPanel] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    budgetEstimate: '',
  });
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showManagePanel, setShowManagePanel] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({ startDate: '', endDate: '', notes: '' });
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);

  const imagesToUpload = useRef<Record<string, File[]>>({});
  const [error, setError] = useState<string | null>(null);
  const message = useRef<Record<string, string>>({});
  const [isMaxMessageSizeExceeded, setIsMaxMessageSizeExceeded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSendMessage() {
    const content = message.current[selectedRoom?.id ?? '']?.trim();
    if (!content || !selectedRoom) return;
    sendMessage(content);
    message.current[selectedRoom.id] = '';
    if (textareaRef.current) textareaRef.current.value = '';
  }

  const MAX_ROOM_NAME_LENGTH = 30;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const MAX_IMAGES_PER_MESSAGE = 5;
  const MAX_MESSAGE_SIZE = 2000;

  useEffect(() => {
    setRoomName(selectedRoom?.name ?? '');
    setIsEditingName(false);
    setShowManagePanel(false);
  }, [selectedRoom?.id]);

  const rawGroupRooms = useMemo(() => rooms.filter(r => r.type === 'GROUP'), [rooms]);
  const dmRooms = useMemo(() => rooms.filter(r => r.type === 'DIRECT_MESSAGE'), [rooms]);

  const [groupOrder, setGroupOrder] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('group-order') ?? '[]'); } catch { return []; }
  });

  const groupRooms = useMemo(() => {
    if (groupOrder.length === 0) return rawGroupRooms;
    const map = new Map(rawGroupRooms.map(r => [r.id, r]));
    const ordered = groupOrder.flatMap(id => map.has(id) ? [map.get(id)!] : []);
    const rest = rawGroupRooms.filter(r => !groupOrder.includes(r.id));
    return [...ordered, ...rest];
  }, [rawGroupRooms, groupOrder]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id)
      return;
    const ids = groupRooms.map(r => r.id);
    const next = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    localStorage.setItem('group-order', JSON.stringify(next));
    setGroupOrder(next);
  }

  const scoredProposals = useMemo(() => {
    if (proposals.length === 0)
      return [];
    const memberIds = members.map(m => m.userId);
    return scoreProposals(proposals, availabilities, memberIds);
  }, [proposals, availabilities, members]);

  function handleSelectRoom(id: string) {
    selectRoom(id);
    setMobileView('chat');
  }

  function handleBack() {
    setMobileView('list');
    selectRoom(null);
  }

  async function handleCreateProposal() {
    if (!proposalForm.destination.trim() || !proposalForm.startDate || !proposalForm.endDate) return;
    await createProposal({
      destination: proposalForm.destination.trim(),
      startDate: proposalForm.startDate,
      endDate: proposalForm.endDate,
      description: proposalForm.description.trim() || 'No description',
      budgetEstimate: proposalForm.budgetEstimate ? parseFloat(proposalForm.budgetEstimate) : undefined,
    });
    setProposalForm({ destination: '', startDate: '', endDate: '', description: '', budgetEstimate: '' });
    setShowProposalForm(false);
  }

  async function handleCreateAvailability() {
    if (!availabilityForm.startDate || !availabilityForm.endDate) return;
    await createAvailability({
      startDate: availabilityForm.startDate,
      endDate: availabilityForm.endDate,
      notes: availabilityForm.notes || undefined,
    });
    setAvailabilityForm({ startDate: '', endDate: '', notes: '' });
    setShowAvailabilityForm(false);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {selectedRoom && (
        <RoomManagePanel
          show={showManagePanel}
          roomName={selectedRoom.name}
          members={members}
          currentUserId={user?.id ?? ''}
          onClose={() => setShowManagePanel(false)}
          onKick={async (userId) => {
            await roomsApi.getRoom(selectedRoom.id).kickMember(userId);
          }}
          onDeleteRoom={async () => {
            setShowManagePanel(false);
            await deleteRoom(selectedRoom.id);
          }}
        />
      )}
      <AnimatePresence>
        {showLeaveConfirm && selectedRoom && (
          <motion.div
            key="leave-confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-border rounded-xl p-6 shadow-xl max-w-sm w-full mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-destructive/10">
                  <LogOut className="w-5 h-5 text-destructive" />
                </div>
                <h2 className="text-lg font-semibold">Leave room</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to leave <span className="font-semibold text-foreground">{selectedRoom.name}</span>? You will no longer have access to this group.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await leaveRoom(selectedRoom.id);
                    setShowLeaveConfirm(false);
                  }}
                  className="px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showAddFriend && <AddFriendModal onClose={() => setShowAddFriend(false)} />}
        {showNewDM && (
          <NewDMModal
            onClose={() => setShowNewDM(false)}
            onCreated={(id) => { setShowNewDM(false); handleSelectRoom(id); }}
          />
        )}
        {showNewGroup && (
          <NewGroupModal
            onClose={() => setShowNewGroup(false)}
            onCreated={(id) => { setShowNewGroup(false); handleSelectRoom(id); }}
          />
        )}
        {showInvite && selectedRoom?.type === 'GROUP' && (
          <InviteToGroupModal roomId={selectedRoom.id} onClose={() => setShowInvite(false)} />
        )}
      </AnimatePresence>

      {/* Left panel - Room list */}
      <RoomListPanel
        rooms={rooms}
        groupRooms={groupRooms}
        dmRooms={dmRooms}
        selectedRoomId={selectedRoom?.id ?? null}
        mobileView={mobileView}
        onSelectRoom={handleSelectRoom}
        onAddFriend={() => setShowAddFriend(true)}
        onNewGroup={() => setShowNewGroup(true)}
        onNewDM={() => setShowNewDM(true)}
        onDragEnd={handleDragEnd}
      />

      <Separator orientation="vertical" className="hidden md:block" />

      {/* Center panel - Chat */}
      <main className={`
        flex-1 flex flex-col h-full overflow-hidden min-w-0
        ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
      `}>
        {selectedRoom ? (
          <>
            <div className="flex flex-col px-4 md:px-8 py-5 border-b border-border/60">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3 md:hidden w-fit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Back
              </button>

              {selectedRoom.type === 'DIRECT_MESSAGE' ? (
                <div className="flex items-center gap-4">
                  <Avatar
                    src={selectedRoom.otherUserPicture ?? ''}
                    alt={selectedRoom.name}
                    fallback={selectedRoom.name}
                    size="md"
                    pictureColor={getAvatarColor(selectedRoom.id)[0]}
                    ringColor="ring-transparent"
                  />
                  <div className="flex flex-col items-start flex-1">
                    <span style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl font-semibold tracking-tight">
                      {selectedRoom.name}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {members.some(m => m.userId === user?.id && m.role === MemberRole.ADMIN) ? (
                    <button
                      className="relative shrink-0 group"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/jpeg,image/png,image/webp';
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (!file) return;
                          try {
                            const { url } = await storageApi.uploadRoomImage(file);
                            await updateRoom(selectedRoom.id, { imageUrl: url });
                          } catch (err) {
                            console.error('Failed to upload room image:', err);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Avatar
                        src={selectedRoom.imageUrl ?? ''}
                        alt={selectedRoom.name}
                        fallback={selectedRoom.name}
                        size="md"
                        pictureColor={getAvatarColor(selectedRoom.id)[0]}
                        ringColor="ring-transparent"
                      />
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  ) : (
                    <div className="relative shrink-0">
                      <Avatar
                        src={selectedRoom.imageUrl ?? ''}
                        alt={selectedRoom.name}
                        fallback={selectedRoom.name}
                        size="md"
                        pictureColor={getAvatarColor(selectedRoom.id)[0]}
                        ringColor="ring-transparent"
                      />
                    </div>
                  )}

                  <AnimatePresence mode="wait" initial={false}>
                    {members.some(m => m.userId === user?.id && m.role === MemberRole.ADMIN) ? (
                      isEditingName ? (
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
                        className="flex flex-col items-start flex-1"
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
                          Click to rename · Enter to save
                        </motion.span>
                      </motion.div>
                    )
                    ) : (
                      <div className="flex flex-col items-start flex-1">
                        <span style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl font-semibold tracking-tight">
                          {roomName}
                        </span>
                      </div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => setShowInvite(true)}
                      title="Invite friends"
                      className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowPlanningPanel(p => !p)}
                      title="Travel planning"
                      className={`shrink-0 p-2 rounded-lg transition-colors ${
                        showPlanningPanel
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <LayoutPanelLeft className="w-4 h-4" />
                    </button>
                    {members.some(m => m.userId === user?.id && m.role === MemberRole.ADMIN) ? (
                      <button
                        onClick={() => setShowManagePanel(p => !p)}
                        title="Manage room"
                        className={`shrink-0 p-2 rounded-lg transition-colors ${
                          showManagePanel
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    ) : members.some(m => m.userId === user?.id) ? (
                      <button
                        onClick={() => setShowLeaveConfirm(true)}
                        title="Leave room"
                        className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Messages */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4">
                  {messages.length !== 0 ? (
                    <div>
                      {messages.map((msg, i) => {
                        const prev = messages[i - 1];
                        const next = messages[i + 1];
                        const msgSenderKey = msg.sender.profile?.userId ?? msg.sender.username;
                        const prevSenderKey = prev?.sender.profile?.userId ?? prev?.sender.username;
                        const nextSenderKey = next?.sender.profile?.userId ?? next?.sender.username;
                        const isOwnMessage = msg.sender.profile?.userId === user?.id;
                        const timeDiff = prev ? new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() : Infinity;
                        const isSameGroupAsPrev = prevSenderKey === msgSenderKey && timeDiff < GROUP_TIME_THRESHOLD_MS;
                        const isSameGroupAsNext = nextSenderKey === msgSenderKey
                          && new Date(next.createdAt).getTime() - new Date(msg.createdAt).getTime() < GROUP_TIME_THRESHOLD_MS;
                        return (
                          <MessageItem
                            key={`${msg.roomId}-${msgSenderKey}-${msg.createdAt}-${i}`}
                            message={msg}
                            senderLabel={isOwnMessage ? 'Vous' : msg.sender.username}
                            isOwn={isOwnMessage}
                            showHeader={!isSameGroupAsPrev}
                            isFirst={!isSameGroupAsPrev}
                            isLast={!isSameGroupAsNext}
                          />
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No messages available</p>
                  )}
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
                            setError(`You cannot send more than ${MAX_IMAGES_PER_MESSAGE} images per message.`);
                            return;
                          }
                          for (let i = 0; i < files.length; i++) {
                            if (files[i].size > MAX_IMAGE_SIZE) {
                              setError(`One or more files are too large.`);
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
                    ref={textareaRef}
                    key={selectedRoom.id}
                    defaultValue={message.current[selectedRoom.id] || ''}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    onChange={(e) => {
                      if (e.target.value.length > MAX_MESSAGE_SIZE) {
                        e.target.value = e.target.value.slice(0, MAX_MESSAGE_SIZE);
                        setIsMaxMessageSizeExceeded(true);
                        setTimeout(() => setIsMaxMessageSizeExceeded(false), 500);
                      }
                      message.current[selectedRoom.id] = e.target.value;
                    }}
                    className="w-full max-h-40 outline-none bg-transparent resize-none field-sizing-content leading-relaxed text-sm placeholder:text-muted-foreground"
                    placeholder="Write your message..."
                  />
                  <motion.button
                    className="shrink-0 w-5 h-5 mb-0.5"
                    whileHover={{ scale: 1.1, color: 'var(--primary)' }}
                    transition={{ duration: 0.2 }}
                    onClick={handleSendMessage}
                  >
                    <Send className="w-full h-full" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Planning panel */}
              <AnimatePresence initial={false}>
                {showPlanningPanel && selectedRoom.type === 'GROUP' && (
                  <PlanningPanel
                    show={showPlanningPanel}
                    tab={planningTab}
                    onTabChange={setPlanningTab}
                    proposals={proposals}
                    scoredProposals={scoredProposals}
                    loadingProposals={loadingProposals}
                    showProposalForm={showProposalForm}
                    proposalForm={proposalForm}
                    onProposalFormChange={setProposalForm}
                    onToggleProposalForm={() => setShowProposalForm(f => !f)}
                    onCreateProposal={handleCreateProposal}
                    onVote={vote}
                    onRemoveVote={removeVote}
                    onSelectProposal={selectProposal}
                    onDeleteProposal={deleteProposal}
                    onAddActivity={(pId: string, title: string, category: string, link?: string) =>
                      createActivity(pId, { title, category: category as ActivityCategory, description: '', link })
                    }
                    onDeleteActivity={deleteActivity}
                    availabilities={availabilities}
                    matchingDateMessage={matchingDateMessage}
                    showAvailabilityForm={showAvailabilityForm}
                    availabilityForm={availabilityForm}
                    onAvailabilityFormChange={setAvailabilityForm}
                    onToggleAvailabilityForm={() => setShowAvailabilityForm(f => !f)}
                    onCreateAvailability={handleCreateAvailability}
                    onDeleteAvailability={deleteAvailability}
                    matchingDate={matchingDate}
                    currentUserId={user?.id ?? ''}
                  />
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Select a conversation to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
}
