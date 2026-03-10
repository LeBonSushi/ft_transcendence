'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Plus, Sparkles } from 'lucide-react';
import { ProposalCard } from './ProposalCard';
import { ProposalForm } from './ProposalForm';
import { AvailabilityList } from './AvailabilityList';
import type { TripProposalWithVotesAndActivities, VoteType, ActivityCategory } from '@travel-planner/shared';

interface PlanningPanelProps {
  show: boolean;
  tab: 'proposals' | 'availabilities';
  onTabChange: (tab: 'proposals' | 'availabilities') => void;
  
  // Proposals
  proposals: TripProposalWithVotesAndActivities[];
  scoredProposals: Array<{
    proposal: TripProposalWithVotesAndActivities;
    consensusLevel: 'perfect' | 'good' | 'partial' | 'poor';
    explanation: string;
    score: number;
  }>;
  loadingProposals: boolean;
  showProposalForm: boolean;
  proposalForm: {
    destination: string;
    startDate: string;
    endDate: string;
    description: string;
    budgetEstimate: string;
  };
  onProposalFormChange: (form: any) => void;
  onToggleProposalForm: () => void;
  onCreateProposal: () => void;
  onVote: (proposalId: string, vote: VoteType, existing?: VoteType) => void;
  onRemoveVote: (proposalId: string) => void;
  onSelectProposal: (proposalId: string) => void;
  onDeleteProposal: (proposalId: string) => void;
  onAddActivity: (proposalId: string, title: string, category: string, link?: string) => void;
  onDeleteActivity: (proposalId: string, activityId: string) => void;
  
  // Availabilities
  availabilities: any[];
  matchingDate: { 
    startDate: Date; 
    endDate: Date; 
    duration: number;
    matchUser: number;
    droppedUser: string[];
  } | null;
  showAvailabilityForm: boolean;
  availabilityForm: {
    startDate: string;
    endDate: string;
    notes: string;
  };
  onAvailabilityFormChange: (form: any) => void;
  onToggleAvailabilityForm: () => void;
  onCreateAvailability: () => void;
  onDeleteAvailability: (id: string) => void;
  
  currentUserId: string;
}

export function PlanningPanel({
  show,
  tab,
  onTabChange,
  proposals,
  scoredProposals,
  loadingProposals,
  showProposalForm,
  proposalForm,
  onProposalFormChange,
  onToggleProposalForm,
  onCreateProposal,
  onVote,
  onRemoveVote,
  onSelectProposal,
  onDeleteProposal,
  onAddActivity,
  onDeleteActivity,
  availabilities,
  matchingDate,
  showAvailabilityForm,
  availabilityForm,
  onAvailabilityFormChange,
  onToggleAvailabilityForm,
  onCreateAvailability,
  onDeleteAvailability,
  currentUserId,
}: PlanningPanelProps) {
  if (!show) return null;

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
            onClick={() => onTabChange('proposals')}
            className={`flex items-center gap-1.5 flex-1 justify-center py-3 text-xs font-medium transition-colors ${
              tab === 'proposals'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Propositions
          </button>
          <button
            onClick={() => onTabChange('availabilities')}
            className={`flex items-center gap-1.5 flex-1 justify-center py-3 text-xs font-medium transition-colors ${
              tab === 'availabilities'
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
          {tab === 'proposals' && (
            <div className="space-y-3">
              <button
                onClick={onToggleProposalForm}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Nouvelle proposition
              </button>

              <ProposalForm
                show={showProposalForm}
                form={proposalForm}
                onFormChange={onProposalFormChange}
                onCreate={onCreateProposal}
                onCancel={onToggleProposalForm}
              />

              {/* Suggestion algo */}
              {!loadingProposals && scoredProposals.length > 0 && (() => {
                const best = scoredProposals[0];
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
                    userId={currentUserId}
                    onVote={onVote}
                    onRemoveVote={onRemoveVote}
                    onSelect={onSelectProposal}
                    onDelete={onDeleteProposal}
                    onAddActivity={onAddActivity}
                    onDeleteActivity={onDeleteActivity}
                  />
                ))
              )}
            </div>
          )}

          {/* Availabilities tab */}
          {tab === 'availabilities' && (
            <div className="space-y-3">
              {/* Matching Date Suggestion */}
              {matchingDate && (
                <div className="rounded-xl border border-green-500/40 bg-green-500/5 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0 text-green-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-green-600">
                      Fenêtre commune idéale
                    </span>
                  </div>
                  <p className="text-xs font-medium text-green-900">
                    {new Date(matchingDate.startDate).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })} → {new Date(matchingDate.endDate).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-[11px] opacity-70 mt-0.5">
                    {matchingDate.duration} jour(s) · {matchingDate.matchUser} personne(s) disponible(s)
                  </p>
                  {matchingDate.droppedUser.length > 0 && (
                    <p className="text-[10px] opacity-60 mt-1 italic">
                      {matchingDate.droppedUser.length} membre(s) non disponible(s)
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={onToggleAvailabilityForm}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter mes disponibilités
              </button>

              <AvailabilityList
                availabilities={availabilities}
                currentUserId={currentUserId}
                showForm={showAvailabilityForm}
                form={availabilityForm}
                onFormChange={onAvailabilityFormChange}
                onCreate={onCreateAvailability}
                onCancelForm={onToggleAvailabilityForm}
                onDelete={onDeleteAvailability}
              />
            </div>
          )}

        </div>
      </motion.div>
    </>
  );
}
