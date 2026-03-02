'use client';

import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useRooms } from "@/hooks/useRooms";
import { useMessages } from "@/hooks/useMessages";
import { usePlanning } from "@/hooks/usePlanning";
import { RoomCard } from "@/components/ui/user/RoomCard";
import { Avatar, getAvatarColor } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useUserStore } from "@/stores/useUserStore";
import { Profile } from "@/components/ui/user/Profile";
import { storageApi } from "@/lib/api";
import type { RoomWithLastMessage, Message, TripProposalWithVotesAndActivities, VoteType, ActivityCategory } from "@travel-planner/shared";
import { Camera, Paperclip, Send, MapPin, Calendar, ChevronDown, ChevronUp, Plus, X, Check, ThumbsUp, ThumbsDown, Minus, Trash2, LayoutPanelLeft } from "lucide-react";
import { LocationInput } from "@/components/ui/LocationInput";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { scoreProposals } from "@/lib/proposalScoring";
import { Sparkles } from "lucide-react";

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

const GROUP_TIME_THRESHOLD_MS = 5 * 60 * 1000;

function MessageItem({
  message,
  senderLabel,
  isOwn,
  showHeader,
  isFirst,
  isLast,
}: {
  message: Message;
  senderLabel: string;
  isOwn: boolean;
  showHeader: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const bubbleRadius = isOwn
    ? `rounded-2xl ${isFirst ? 'rounded-tr-sm' : ''} ${isLast ? '' : 'rounded-br-sm'}`
    : `rounded-2xl ${isFirst ? 'rounded-tl-sm' : ''} ${isLast ? '' : 'rounded-bl-sm'}`;

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${showHeader ? 'mt-4' : 'mt-0.5'}`}>
      {showHeader && (
        <div className={`flex items-baseline gap-2 mb-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold text-foreground">{senderLabel}</span>
          <span className="text-[10px] text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
      <div
        className={`px-3.5 py-2 text-sm max-w-sm md:max-w-md break-words ${bubbleRadius} ${
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

const VOTE_ICONS = {
  YES: ThumbsUp,
  NO: ThumbsDown,
  MAYBE: Minus,
};

const VOTE_LABELS = {
  YES: 'Pour',
  NO: 'Contre',
  MAYBE: 'Peut-être',
};

const VOTE_COLORS = {
  YES: 'text-green-500 border-green-500/40 bg-green-500/10',
  NO: 'text-red-500 border-red-500/40 bg-red-500/10',
  MAYBE: 'text-amber-500 border-amber-500/40 bg-amber-500/10',
};

const ACTIVITY_CATEGORY_LABELS: Record<string, string> = {
  RESTAURANT: '🍽️ Restaurant',
  MUSEUM: '🏛️ Musée',
  NIGHTLIFE: '🎉 Nuit',
  OUTDOOR: '🌿 Plein air',
  OTHER: '✨ Autre',
};

function CategorySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setStyle({ position: 'fixed', top: rect.bottom + 4, left: rect.left, minWidth: rect.width, zIndex: 9999 });
  }, [open]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('[data-category-popup]')
      ) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const label = ACTIVITY_CATEGORY_LABELS[value] ?? value;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 text-[11px] px-1.5 py-1 rounded-md bg-background border transition-colors outline-none shrink-0 ${open ? 'border-primary/60' : 'border-border hover:border-primary/40'}`}
      >
        {label}
        <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
      </button>
      {open && createPortal(
        <div data-category-popup className="rounded-lg border border-border bg-popover shadow-lg overflow-hidden" style={style}>
          {Object.entries(ACTIVITY_CATEGORY_LABELS).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onPointerDown={e => { e.preventDefault(); onChange(k); setOpen(false); }}
              className={`w-full text-left text-[11px] px-3 py-1.5 transition-colors ${k === value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
            >
              {l}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

function ProposalCard({
  proposal,
  userId,
  onVote,
  onRemoveVote,
  onSelect,
  onDelete,
  onAddActivity,
  onDeleteActivity,
}: {
  proposal: TripProposalWithVotesAndActivities;
  userId: string;
  onVote: (proposalId: string, vote: VoteType, existing?: VoteType) => void;
  onRemoveVote: (proposalId: string) => void;
  onSelect: (proposalId: string) => void;
  onDelete: (proposalId: string) => void;
  onAddActivity: (proposalId: string, title: string, category: string, link?: string) => void;
  onDeleteActivity: (proposalId: string, activityId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pendingActivities, setPendingActivities] = useState<{ id: number; title: string; category: string; link: string }[]>([]);
  const nextPendingId = useRef(0);

  const myVote = proposal.votes.find(v => v.userId === userId);
  const voteCounts = proposal.votes.reduce((acc, v) => {
    acc[v.vote] = (acc[v.vote] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const startDate = new Date(proposal.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const endDate = new Date(proposal.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className={`rounded-xl border ${proposal.isSelected ? 'border-primary/60 bg-primary/5' : 'border-border bg-card'} overflow-hidden`}>
      {/* Header */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {proposal.isSelected && (
                <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full shrink-0">
                  Sélectionné
                </span>
              )}
              <span className="font-semibold text-sm truncate">{proposal.destination}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>{startDate} → {endDate}</span>
            </div>
            {proposal.budgetEstimate && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Budget estimé : <span className="font-medium text-foreground">{Number(proposal.budgetEstimate).toLocaleString('fr-FR')} €</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!proposal.isSelected && (
              <button
                onClick={() => onSelect(proposal.id)}
                title="Sélectionner cette proposition"
                className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onDelete(proposal.id)}
              title="Supprimer"
              className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Votes */}
        <div className="flex items-center gap-1.5 mt-2.5">
          {(['YES', 'NO', 'MAYBE'] as VoteType[]).map((v) => {
            const Icon = VOTE_ICONS[v];
            const isMyVote = myVote?.vote === v;
            return (
              <button
                key={v}
                onClick={() => {
                  if (isMyVote) onRemoveVote(proposal.id);
                  else onVote(proposal.id, v, myVote?.vote);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                  isMyVote ? VOTE_COLORS[v] : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
                <span>{VOTE_LABELS[v]}</span>
                {voteCounts[v] ? <span className="ml-0.5 opacity-70">({voteCounts[v]})</span> : null}
              </button>
            );
          })}
          <button
            onClick={() => setExpanded(e => !e)}
            className="ml-auto p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded: description + activities */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-border/60 pt-2.5 space-y-2.5">
              {proposal.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{proposal.description}</p>
              )}

              {/* Activities */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Activités</span>
                  <button
                    onClick={() => {
                      const id = nextPendingId.current++;
                      setPendingActivities(prev => [...prev, { id, title: '', category: 'OTHER', link: '' }]);
                    }}
                    className="flex items-center gap-0.5 text-[11px] text-primary hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    Ajouter
                  </button>
                </div>

                {/* Saved activities */}
                {proposal.activities.length > 0 && (
                  <ul className="space-y-1.5 mb-2">
                    {proposal.activities.map(a => (
                      <li key={a.id} className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-muted-foreground shrink-0">{ACTIVITY_CATEGORY_LABELS[a.category]?.split(' ')[0]}</span>
                            <span className="font-medium truncate">{a.title}</span>
                          </div>
                          {a.link && (
                            <a
                              href={a.link.startsWith('http') ? a.link : `https://${a.link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-primary hover:underline truncate block max-w-full"
                            >
                              {a.link}
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => onDeleteActivity(proposal.id, a.id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Pending (unsaved) activity rows */}
                {pendingActivities.length > 0 && (
                  <ul className="space-y-2">
                    {pendingActivities.map(row => (
                      <li key={row.id} className="rounded-lg border border-border bg-muted/40 p-2 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <CategorySelect
                            value={row.category}
                            onChange={v => setPendingActivities(prev => prev.map(r => r.id === row.id ? { ...r, category: v } : r))}
                          />
                          <input
                            autoFocus
                            placeholder="Nom de l'activité"
                            value={row.title}
                            onChange={e => setPendingActivities(prev => prev.map(r => r.id === row.id ? { ...r, title: e.target.value } : r))}
                            onBlur={() => {
                              if (row.title.trim()) {
                                onAddActivity(proposal.id, row.title.trim(), row.category, row.link.trim() || undefined);
                                setPendingActivities(prev => prev.filter(r => r.id !== row.id));
                              }
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && row.title.trim()) {
                                onAddActivity(proposal.id, row.title.trim(), row.category, row.link.trim() || undefined);
                                setPendingActivities(prev => prev.filter(r => r.id !== row.id));
                              }
                              if (e.key === 'Escape') {
                                setPendingActivities(prev => prev.filter(r => r.id !== row.id));
                              }
                            }}
                            className="flex-1 min-w-0 text-xs px-2 py-1 rounded-md bg-background border border-border outline-none focus:border-primary/60"
                          />
                          <button
                            onMouseDown={e => { e.preventDefault(); setPendingActivities(prev => prev.filter(r => r.id !== row.id)); }}
                            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <input
                          placeholder="Lien / adresse (optionnel)"
                          value={row.link}
                          onChange={e => setPendingActivities(prev => prev.map(r => r.id === row.id ? { ...r, link: e.target.value } : r))}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && row.title.trim()) {
                              onAddActivity(proposal.id, row.title.trim(), row.category, row.link.trim() || undefined);
                              setPendingActivities(prev => prev.filter(r => r.id !== row.id));
                            }
                          }}
                          className="w-full text-xs px-2 py-1 rounded-md bg-background border border-border outline-none focus:border-primary/60"
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {proposal.activities.length === 0 && pendingActivities.length === 0 && (
                  <p className="text-[11px] text-muted-foreground italic">Aucune activité suggérée</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const { rooms, selectedRoom, selectRoom, updateRoom, createRoom } = useRooms();
  const { messages, sendMessage } = useMessages(selectedRoom?.id ?? null);
  const {
    proposals, availabilities, members, loadingProposals,
    createProposal, deleteProposal, selectProposal,
    vote, removeVote,
    createActivity, deleteActivity,
    createAvailability, deleteAvailability,
  } = usePlanning(selectedRoom?.id ?? null);
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
  }, [selectedRoom?.id]);

  const groupRooms = useMemo(() => rooms.filter(r => r.type === 'GROUP'), [rooms]);
  const dmRooms = useMemo(() => rooms.filter(r => r.type === 'DIRECT_MESSAGE'), [rooms]);

  const scoredProposals = useMemo(() => {
    if (proposals.length === 0) return [];
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
      description: proposalForm.description.trim() || 'Aucune description',
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

  const myAvailabilities = availabilities.filter(a => a.userId === user?.id);

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
                roomPicture={room.imageUrl}
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
                roomPicture={room.imageUrl}
                isSelected={selectedRoom?.id === room.id}
                onClick={() => handleSelectRoom(room.id)}
              />
            ))}
          </div>
        </aside>
      </div>

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
                Retour
              </button>

              <div className="flex items-center gap-4">
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
                        Cliquer pour renommer · Entrée pour sauvegarder
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Planning panel toggle */}
                <button
                  onClick={() => setShowPlanningPanel(p => !p)}
                  title="Planification du voyage"
                  className={`shrink-0 ml-auto p-2 rounded-lg transition-colors ${
                    showPlanningPanel
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <LayoutPanelLeft className="w-4 h-4" />
                </button>
              </div>
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
                        const timeDiff = prev ? new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() : Infinity;
                        const isSameGroupAsPrev = prev?.senderId === msg.senderId && timeDiff < GROUP_TIME_THRESHOLD_MS;
                        const isSameGroupAsNext = next?.senderId === msg.senderId
                          && new Date(next.createdAt).getTime() - new Date(msg.createdAt).getTime() < GROUP_TIME_THRESHOLD_MS;

                        return (
                          <MessageItem
                            key={msg.id}
                            message={msg}
                            senderLabel={msg.senderId === user?.id ? 'Vous' : msg.senderId}
                            isOwn={msg.senderId === user?.id}
                            showHeader={!isSameGroupAsPrev}
                            isFirst={!isSameGroupAsPrev}
                            isLast={!isSameGroupAsNext}
                          />
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Aucun message disponible</p>
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
                    placeholder="Écrivez votre message..."
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
                {showPlanningPanel && (
                  <>
                    <Separator orientation="vertical" />
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 320, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="flex flex-col h-full overflow-hidden shrink-0"
                    >
                      {/* Tabs */}
                      <div className="flex border-b border-border/60 shrink-0">
                        <button
                          onClick={() => setPlanningTab('proposals')}
                          className={`flex items-center gap-1.5 flex-1 justify-center py-3 text-xs font-medium transition-colors ${
                            planningTab === 'proposals'
                              ? 'text-primary border-b-2 border-primary'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          Propositions
                        </button>
                        <button
                          onClick={() => setPlanningTab('availabilities')}
                          className={`flex items-center gap-1.5 flex-1 justify-center py-3 text-xs font-medium transition-colors ${
                            planningTab === 'availabilities'
                              ? 'text-primary border-b-2 border-primary'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Disponibilités
                        </button>
                      </div>

                      {/* Tab content */}
                      <div className="flex-1 overflow-y-auto p-3">

                        {/* Proposals tab */}
                        {planningTab === 'proposals' && (
                          <div className="space-y-3">
                            <button
                              onClick={() => setShowProposalForm(f => !f)}
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Nouvelle proposition
                            </button>

                            <AnimatePresence initial={false}>
                              {showProposalForm && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-2 p-3 rounded-xl border border-border bg-card">
                                    <LocationInput
                                      autoFocus
                                      placeholder="Destination *"
                                      value={proposalForm.destination}
                                      onChange={v => setProposalForm(f => ({ ...f, destination: v }))}
                                    />
                                    <DateRangePicker
                                      startDate={proposalForm.startDate}
                                      endDate={proposalForm.endDate}
                                      onChangeStart={v => setProposalForm(f => ({ ...f, startDate: v }))}
                                      onChangeEnd={v => setProposalForm(f => ({ ...f, endDate: v }))}
                                      placeholderStart="Date de départ *"
                                      placeholderEnd="Date de retour *"
                                    />
                                    <input
                                      placeholder="Budget estimé (€)"
                                      type="number"
                                      value={proposalForm.budgetEstimate}
                                      onChange={e => setProposalForm(f => ({ ...f, budgetEstimate: e.target.value }))}
                                      className="w-full text-xs px-2.5 py-1.5 rounded-md bg-muted border border-border outline-none focus:border-primary/60"
                                    />
                                    <textarea
                                      placeholder="Description"
                                      value={proposalForm.description}
                                      onChange={e => setProposalForm(f => ({ ...f, description: e.target.value }))}
                                      rows={2}
                                      className="w-full text-xs px-2.5 py-1.5 rounded-md bg-muted border border-border outline-none focus:border-primary/60 resize-none"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={handleCreateProposal}
                                        disabled={!proposalForm.destination || !proposalForm.startDate || !proposalForm.endDate}
                                        className="flex-1 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                                      >
                                        Créer
                                      </button>
                                      <button
                                        onClick={() => setShowProposalForm(false)}
                                        className="flex-1 py-1.5 bg-muted text-muted-foreground text-xs font-medium rounded-lg hover:text-foreground"
                                      >
                                        Annuler
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Suggestion algo */}
                            {!loadingProposals && scoredProposals.length > 0 && (() => {
                              const best = scoredProposals[0];
                              const CONSENSUS_COLORS = {
                                perfect: 'border-green-500/40 bg-green-500/5 text-green-600',
                                good: 'border-primary/40 bg-primary/5 text-primary',
                                partial: 'border-amber-500/40 bg-amber-500/5 text-amber-600',
                                poor: 'border-border bg-muted text-muted-foreground',
                              };
                              const CONSENSUS_LABELS = {
                                perfect: 'Consensus parfait',
                                good: 'Bon consensus',
                                partial: 'Consensus partiel',
                                poor: 'Peu de consensus',
                              };
                              return (
                                <div className={`rounded-xl border p-3 ${CONSENSUS_COLORS[best.consensusLevel]}`}>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                                      {CONSENSUS_LABELS[best.consensusLevel]}
                                    </span>
                                  </div>
                                  <p className="text-xs font-medium">{best.proposal.destination}</p>
                                  <p className="text-[11px] opacity-70 mt-0.5">{best.explanation}</p>
                                  {scoredProposals.length > 1 && best.consensusLevel !== 'perfect' && (
                                    <p className="text-[10px] opacity-50 mt-1">
                                      Alternatives : {scoredProposals.slice(1, 3).map(s => s.proposal.destination).join(', ')}
                                    </p>
                                  )}
                                </div>
                              );
                            })()}

                            {loadingProposals ? (
                              <p className="text-xs text-center text-muted-foreground py-4">Chargement…</p>
                            ) : proposals.length === 0 ? (
                              <p className="text-xs text-center text-muted-foreground py-4 italic">Aucune proposition pour l'instant</p>
                            ) : (
                              proposals.map(proposal => (
                                <ProposalCard
                                  key={proposal.id}
                                  proposal={proposal}
                                  userId={user?.id ?? ''}
                                  onVote={vote}
                                  onRemoveVote={removeVote}
                                  onSelect={selectProposal}
                                  onDelete={deleteProposal}
                                  onAddActivity={(pId, title, category, link) =>
                                    createActivity(pId, { title, category: category as ActivityCategory, description: '', link })
                                  }
                                  onDeleteActivity={deleteActivity}
                                />
                              ))
                            )}
                          </div>
                        )}

                        {/* Availabilities tab */}
                        {planningTab === 'availabilities' && (
                          <div className="space-y-3">
                            <button
                              onClick={() => setShowAvailabilityForm(f => !f)}
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Ajouter mes disponibilités
                            </button>

                            <AnimatePresence initial={false}>
                              {showAvailabilityForm && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-2 p-3 rounded-xl border border-border bg-card">
                                    <DateRangePicker
                                      startDate={availabilityForm.startDate}
                                      endDate={availabilityForm.endDate}
                                      onChangeStart={v => setAvailabilityForm(f => ({ ...f, startDate: v }))}
                                      onChangeEnd={v => setAvailabilityForm(f => ({ ...f, endDate: v }))}
                                      placeholderStart="Début disponibilité"
                                      placeholderEnd="Fin disponibilité"
                                    />
                                    <input
                                      placeholder="Notes (optionnel)"
                                      value={availabilityForm.notes}
                                      onChange={e => setAvailabilityForm(f => ({ ...f, notes: e.target.value }))}
                                      className="w-full text-xs px-2.5 py-1.5 rounded-md bg-muted border border-border outline-none focus:border-primary/60"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={handleCreateAvailability}
                                        className="flex-1 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg"
                                      >
                                        Ajouter
                                      </button>
                                      <button
                                        onClick={() => setShowAvailabilityForm(false)}
                                        className="flex-1 py-1.5 bg-muted text-muted-foreground text-xs font-medium rounded-lg hover:text-foreground"
                                      >
                                        Annuler
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* My availabilities */}
                            {myAvailabilities.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Mes disponibilités</p>
                                <div className="space-y-1.5">
                                  {myAvailabilities.map(av => (
                                    <div key={av.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                                      <div className="min-w-0">
                                        <p className="text-xs font-medium">
                                          {new Date(av.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} → {new Date(av.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                        {av.notes && <p className="text-[11px] text-muted-foreground truncate">{av.notes}</p>}
                                      </div>
                                      <button
                                        onClick={() => deleteAvailability(av.id)}
                                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Other members' availabilities */}
                            {availabilities.filter(a => a.userId !== user?.id).length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Membres</p>
                                <div className="space-y-1.5">
                                  {availabilities.filter(a => a.userId !== user?.id).map(av => (
                                    <div key={av.id} className="p-2 rounded-lg bg-muted border border-border">
                                      <p className="text-xs font-medium">
                                        {av.user.profile?.firstName ?? av.user.username}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {new Date(av.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} → {new Date(av.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                      </p>
                                      {av.notes && <p className="text-[11px] text-muted-foreground italic">{av.notes}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {availabilities.length === 0 && (
                              <p className="text-xs text-center text-muted-foreground py-4 italic">Aucune disponibilité renseignée</p>
                            )}
                          </div>
                        )}

                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
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
