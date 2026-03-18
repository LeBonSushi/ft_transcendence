'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { friendsApi } from '@/lib/api';
import { apiClient } from '@/lib/api/client';
import { API_ROUTES } from '@travel-planner/shared';
import { useUserStore } from '@/stores/useUserStore';
import type { User } from '@travel-planner/shared';
import { UserPlus, X, Search, Loader2, Check, ShieldBan, ShieldCheck, UserMinus } from 'lucide-react';
import type { FriendshipRelation } from '@/lib/api/friends';

export function AddFriendModal({ onClose }: { onClose: () => void }) {
  const { user } = useUserStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [sendError, setSendError] = useState<string | null>(null);
  const [relations, setRelations] = useState<FriendshipRelation[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [tab, setTab] = useState<'search' | 'requests' | 'friends'>('search');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function reloadRelations() {
    try {
      setLoadingRelations(true);
      const [relationList, incomingRequests] = await Promise.all([
        friendsApi.getRelations(),
        friendsApi.getFriendRequests(),
      ]);

      const incomingMap = new Map(incomingRequests.map((request) => [request.id, request]));
      const normalized = relationList.map((relation) => {
        const incoming = incomingMap.get(relation.id);
        if (!incoming) return relation;
        return { ...relation, status: incoming.status };
      });

      setRelations(normalized);
    } finally {
      setLoadingRelations(false);
    }
  }

  useEffect(() => {
    reloadRelations();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      setSendError(null);
      try {
        const data = await apiClient.get<User[]>(API_ROUTES.USERS.SEARCH(query.trim()));
        setResults(data);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  async function handleSend(userId: string) {
    try {
      setSendError(null);
      await friendsApi.sendRequest(userId);
      setSent(s => ({ ...s, [userId]: true }));
      await reloadRelations();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : null;

        if (error.response?.status === 403 && apiMessage === 'Friend request already exists') {
          setSendError('A friend request has already been sent to this user.');
          return;
        }

        if (error.response?.status === 404 && apiMessage === 'Already friends') {
          setSendError('You are already friends with this user.');
          return;
        }

        if (apiMessage) {
          setSendError(apiMessage);
          return;
        }
      }

      setSendError('Unable to send the friend request right now.');
    }
  }

  const getPeer = (relation: FriendshipRelation) => {
    return relation.userId === user?.id ? relation.friend : relation.user;
  };

  const pendingRequests = relations.filter(
    (relation) => relation.status === 'PENDING' && relation.friendId === user?.id
  );
  const managedFriends = relations.filter(
    (relation) => relation.status === 'ACCEPTED' || relation.status === 'BLOCKED'
  );

  async function handleAccept(friendshipId: string) {
    await friendsApi.acceptFriendRequest(friendshipId);
    await reloadRelations();
  }

  async function handleReject(friendshipId: string) {
    await friendsApi.rejectFriendRequest(friendshipId);
    await reloadRelations();
  }

  async function handleBlock(targetId: string) {
    await friendsApi.blockFriend(targetId);
    await reloadRelations();
  }

  async function handleUnblock(friendId: string) {
    await friendsApi.unblockFriend(friendId);
    await reloadRelations();
  }

  async function handleRemove(friendId: string) {
    await friendsApi.removeFriend(friendId);
    await reloadRelations();
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
            <UserPlus size={16} className="text-muted-foreground" />
            <span className="font-semibold text-sm">Add a friend</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => setTab('search')}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${tab === 'search' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Research
            </button>
            <button
              onClick={() => setTab('requests')}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${tab === 'requests' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Requests
            </button>
            <button
              onClick={() => setTab('friends')}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${tab === 'friends' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Friends
            </button>
          </div>

          {tab === 'search' && (
            <>
          {sendError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {sendError}
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border focus-within:border-primary/50 transition-colors">
            {loading ? <Loader2 size={15} className="text-muted-foreground animate-spin shrink-0" /> : <Search size={15} className="text-muted-foreground shrink-0" />}
            <input
              ref={inputRef}
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                if (sendError) setSendError(null);
              }}
              placeholder="Research by @username…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && <button onClick={() => setQuery('')}><X size={13} className="text-muted-foreground hover:text-foreground" /></button>}
          </div>

          <div className="min-h-[60px]">
            {!query.trim() && (
              <p className="text-xs text-center text-muted-foreground py-4">Type a name to search</p>
            )}
            {query.trim() && !loading && results.length === 0 && (
              <p className="text-xs text-center text-muted-foreground py-4">No users found</p>
            )}
            {results.length > 0 && (
              <ul className="space-y-1.5">
                {results.map(u => (
                  <li key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {(u.profile?.firstName?.[0] ?? u.username[0]).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {u.profile?.firstName && u.profile?.lastName
                          ? `${u.profile.firstName} ${u.profile.lastName}`
                          : u.username}
                      </p>
                      <p className="text-[11px] text-muted-foreground">@{u.username}</p>
                    </div>
                    <button
                      onClick={() => handleSend(u.id)}
                      disabled={sent[u.id]}
                      className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        sent[u.id]
                          ? 'bg-green-500/10 text-green-600 cursor-default'
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {sent[u.id] ? <><Check size={12} /> Send</> : <><UserPlus size={12} /> Add</>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
            </>
          )}

          {tab === 'requests' && (
            <div className="min-h-[60px]">
              {loadingRelations && <p className="text-xs text-center text-muted-foreground py-4">Loading...</p>}
              {!loadingRelations && pendingRequests.length === 0 && (
                <p className="text-xs text-center text-muted-foreground py-4">No pending requests</p>
              )}
              {!loadingRelations && pendingRequests.length > 0 && (
                <ul className="space-y-1.5">
                  {pendingRequests.map((relation) => {
                    const peer = getPeer(relation);
                    const name = peer.profile?.firstName
                      ? `${peer.profile.firstName} ${peer.profile.lastName ?? ''}`.trim()
                      : peer.username;

                    return (
                      <li key={relation.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {(peer.profile?.firstName?.[0] ?? peer.username[0]).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{name}</p>
                          <p className="text-[11px] text-muted-foreground">@{peer.username}</p>
                        </div>
                        <button
                          onClick={() => handleAccept(relation.id)}
                          className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          <Check size={12} /> Accept
                        </button>
                        <button
                          onClick={() => handleReject(relation.id)}
                          className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <X size={12} /> Refuse
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {tab === 'friends' && (
            <div className="min-h-[60px]">
              {loadingRelations && <p className="text-xs text-center text-muted-foreground py-4">Loading...</p>}
              {!loadingRelations && managedFriends.length === 0 && (
                <p className="text-xs text-center text-muted-foreground py-4">No friends to deal with</p>
              )}
              {!loadingRelations && managedFriends.length > 0 && (
                <ul className="space-y-1.5">
                  {managedFriends.map((relation) => {
                    const peer = getPeer(relation);
                    const name = peer.profile?.firstName
                      ? `${peer.profile.firstName} ${peer.profile.lastName ?? ''}`.trim()
                      : peer.username;

                    return (
                      <li key={relation.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {(peer.profile?.firstName?.[0] ?? peer.username[0]).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{name}</p>
                          <p className="text-[11px] text-muted-foreground">@{peer.username}</p>
                        </div>
                        {relation.status === 'BLOCKED' ? (
                          <button
                            onClick={() => handleUnblock(peer.id)}
                            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            <ShieldCheck size={12} /> Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(relation.id)}
                            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                          >
                            <ShieldBan size={12} /> Block
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(peer.id)}
                          className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <UserMinus size={12} /> Delete
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
