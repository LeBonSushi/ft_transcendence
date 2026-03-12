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
  matchingDateMessage: string | null;
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
  matchingDateMessage,
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
    perfect: 'Perfect consensus',
    good: 'Good consensus',
    partial: 'Partial consensus',
    poor: 'Little consensus',
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
            Proposals
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
            Availability
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
                New proposal
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
                <p className="text-xs text-center text-muted-foreground py-4">Loading...</p>
              ) : proposals.length === 0 ? (
                <p className="text-xs text-center text-muted-foreground py-4 italic">No proposals yet</p>
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
              {(matchingDate || matchingDateMessage) && (
                <div className={`rounded-xl border p-3 ${
                  matchingDate
                    ? 'border-green-500/40 bg-green-500/5'
                    : 'border-border bg-muted/30'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className={`w-3.5 h-3.5 shrink-0 ${
                      matchingDate ? 'text-green-600' : 'text-muted-foreground'
                    }`} />
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                      matchingDate ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {matchingDate ? 'Ideal common window' : 'Matching date'}
                    </span>
                  </div>
                  {matchingDate ? (
                    <>
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
                        {matchingDate.duration} day(s) · {matchingDate.matchUser} person(s) available(s)
                      </p>
                      {matchingDate.droppedUser.length > 0 && (
                        <p className="text-[10px] opacity-60 mt-1 italic">
                          {matchingDate.droppedUser.length} member(s) not available(s)
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {matchingDateMessage}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={onToggleAvailabilityForm}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add my availability
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
