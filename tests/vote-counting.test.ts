import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
const voteCounts = new Map();
const voterParticipation = new Map();

// Mock ballot management contract
const mockBallotManagement = {
  getBallot: (ballotId: number) => {
    if (ballotId === 1) {
      return {
        status: 'active',
        options: ['Option A', 'Option B', 'Option C']
      };
    }
    return null;
  }
};

// Simulated contract functions
function castVote(ballotId: number, option: string, voter: string) {
  const ballot = mockBallotManagement.getBallot(ballotId);
  if (!ballot) throw new Error('Invalid ballot');
  if (ballot.status !== 'active') throw new Error('Invalid ballot');
  if (!ballot.options.includes(option)) throw new Error('Invalid vote');
  
  const participationKey = `${ballotId}-${voter}`;
  if (voterParticipation.get(participationKey)) throw new Error('Already voted');
  
  voterParticipation.set(participationKey, true);
  const voteKey = `${ballotId}-${option}`;
  const currentCount = voteCounts.get(voteKey) || 0;
  voteCounts.set(voteKey, currentCount + 1);
  return true;
}

function getVoteCount(ballotId: number, option: string) {
  return voteCounts.get(`${ballotId}-${option}`) || 0;
}

function hasVoted(ballotId: number, voter: string) {
  return voterParticipation.get(`${ballotId}-${voter}`) || false;
}

describe('Vote Counting Contract', () => {
  beforeEach(() => {
    voteCounts.clear();
    voterParticipation.clear();
  });
  
  it('should cast a vote', () => {
    expect(castVote(1, 'Option A', 'voter1')).toBe(true);
    expect(getVoteCount(1, 'Option A')).toBe(1);
    expect(hasVoted(1, 'voter1')).toBe(true);
  });
  
  it('should not allow voting twice', () => {
    castVote(1, 'Option B', 'voter2');
    expect(() => castVote(1, 'Option C', 'voter2')).toThrow('Already voted');
  });
  
  it('should not allow voting for invalid option', () => {
    expect(() => castVote(1, 'Invalid Option', 'voter3')).toThrow('Invalid vote');
  });
  
  it('should count votes correctly', () => {
    castVote(1, 'Option A', 'voter4');
    castVote(1, 'Option A', 'voter5');
    castVote(1, 'Option B', 'voter6');
    expect(getVoteCount(1, 'Option A')).toBe(2);
    expect(getVoteCount(1, 'Option B')).toBe(1);
    expect(getVoteCount(1, 'Option C')).toBe(0);
  });
  
  it('should track voter participation correctly', () => {
    castVote(1, 'Option A', 'voter7');
    castVote(1, 'Option B', 'voter8');
    expect(hasVoted(1, 'voter7')).toBe(true);
    expect(hasVoted(1, 'voter8')).toBe(true);
    expect(hasVoted(1, 'voter9')).toBe(false);
  });
  
  it('should not allow voting on invalid ballot', () => {
    expect(() => castVote(2, 'Option A', 'voter10')).toThrow('Invalid ballot');
  });
});

