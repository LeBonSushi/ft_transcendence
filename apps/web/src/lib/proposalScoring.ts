import type { TripProposalWithVotesAndActivities, UserAvailabilityWithUser } from '@travel-planner/shared';

export interface ProposalScore {
  proposal: TripProposalWithVotesAndActivities;
  score: number;
  voteScore: number;
  availabilityScore: number;
  availableMembers: number;
  totalMembers: number;
  consensusLevel: 'perfect' | 'good' | 'partial' | 'poor';
  explanation: string;
}

const VOTE_POINTS: Record<string, number> = {
  YES: 3,
  MAYBE: 1,
  NO: -2,
};

function datesOverlap(
  startA: Date, endA: Date,
  startB: Date, endB: Date,
): boolean {
  return startA <= endB && endA >= startB;
}

function overlapDays(
  startA: Date, endA: Date,
  startB: Date, endB: Date,
): number {
  const overlapStart = new Date(Math.max(startA.getTime(), startB.getTime()));
  const overlapEnd = new Date(Math.min(endA.getTime(), endB.getTime()));
  if (overlapStart > overlapEnd) return 0;
  return Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function scoreProposals(
  proposals: TripProposalWithVotesAndActivities[],
  availabilities: UserAvailabilityWithUser[],
  memberIds: string[],
): ProposalScore[] {
  const totalMembers = memberIds.length;

  return proposals
    .map(proposal => {
      const propStart = new Date(proposal.startDate);
      const propEnd = new Date(proposal.endDate);
      const propDuration = overlapDays(propStart, propEnd, propStart, propEnd);

      // --- Vote score ---
      const voterIds = new Set(proposal.votes.map(v => v.userId));
      let rawVoteScore = 0;
      for (const vote of proposal.votes) {
        rawVoteScore += VOTE_POINTS[vote.vote] ?? 0;
      }
      // Members who haven't voted count as neutral (0), not negative
      // Normalize: max possible = totalMembers * 3
      const maxVoteScore = totalMembers * VOTE_POINTS.YES;
      const voteScore = maxVoteScore > 0 ? (rawVoteScore / maxVoteScore) * 100 : 0;

      // --- Availability score ---
      // Count how many members have at least one availability window overlapping the proposal
      const availableMembers = memberIds.filter(memberId => {
        const memberAvails = availabilities.filter(a => a.userId === memberId);
        if (memberAvails.length === 0) return false; // No availability declared = unknown
        return memberAvails.some(a =>
          datesOverlap(new Date(a.startDate), new Date(a.endDate), propStart, propEnd)
        );
      }).length;

      // Members with no declared availability are excluded from ratio
      const membersWithAvailability = memberIds.filter(id =>
        availabilities.some(a => a.userId === id)
      ).length;

      const availabilityScore = membersWithAvailability > 0
        ? (availableMembers / membersWithAvailability) * 100
        : 50; // If nobody declared availability, neutral score

      // --- Combined score (votes weighted more) ---
      const hasAnyVeto = proposal.votes.some(v => v.vote === 'NO');
      const score = (voteScore * 0.65) + (availabilityScore * 0.35) - (hasAnyVeto ? 5 : 0);

      // --- Consensus level ---
      const yesCount = proposal.votes.filter(v => v.vote === 'YES').length;
      const noCount = proposal.votes.filter(v => v.vote === 'NO').length;
      let consensusLevel: ProposalScore['consensusLevel'];

      if (noCount === 0 && yesCount >= Math.ceil(totalMembers * 0.7)) {
        consensusLevel = 'perfect';
      } else if (noCount === 0 && yesCount > 0) {
        consensusLevel = 'good';
      } else if (noCount > 0 && yesCount > noCount) {
        consensusLevel = 'partial';
      } else {
        consensusLevel = 'poor';
      }

      // --- Human-readable explanation ---
      const parts: string[] = [];
      if (yesCount > 0) parts.push(`${yesCount} pour`);
      if (proposal.votes.filter(v => v.vote === 'MAYBE').length > 0)
        parts.push(`${proposal.votes.filter(v => v.vote === 'MAYBE').length} peut-être`);
      if (noCount > 0) parts.push(`${noCount} contre`);

      if (membersWithAvailability > 0) {
        parts.push(`${availableMembers}/${membersWithAvailability} disponibles`);
      }

      const explanation = parts.join(' · ') || 'Aucun vote';

      return { proposal, score, voteScore, availabilityScore, availableMembers, totalMembers, consensusLevel, explanation };
    })
    .sort((a, b) => b.score - a.score);
}
