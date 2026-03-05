'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { TripProposalWithVotesAndActivities, VoteType } from '@travel-planner/shared';
import { Calendar, ChevronDown, ChevronUp, Check, Trash2, Plus, X, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { CategorySelect } from './CategorySelect';

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

export function ProposalCard({
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
