import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
const ballots = new Map();
let ballotCount = 0;

// Simulated contract functions
function createBallot(title: string, description: string, options: string[], duration: number, sender: string) {
  if (sender !== 'CONTRACT_OWNER') throw new Error('Not authorized');
  const ballotId = ++ballotCount;
  const startBlock = Date.now();
  ballots.set(ballotId, {
    title,
    description,
    options,
    startBlock,
    endBlock: startBlock + duration,
    status: 'active'
  });
  return ballotId;
}

function closeBallot(ballotId: number, sender: string) {
  if (sender !== 'CONTRACT_OWNER') throw new Error('Not authorized');
  if (!ballots.has(ballotId)) throw new Error('Invalid ballot');
  const ballot = ballots.get(ballotId);
  if (ballot.status !== 'active') throw new Error('Ballot closed');
  ballot.status = 'closed';
  ballots.set(ballotId, ballot);
  return true;
}

describe('Ballot Management Contract', () => {
  beforeEach(() => {
    ballots.clear();
    ballotCount = 0;
  });
  
  it('should create a new ballot', () => {
    const id = createBallot('Test Ballot', 'A test ballot', ['Option 1', 'Option 2'], 86400000, 'CONTRACT_OWNER');
    expect(id).toBe(1);
    expect(ballots.size).toBe(1);
    const ballot = ballots.get(id);
    expect(ballot.title).toBe('Test Ballot');
    expect(ballot.status).toBe('active');
  });
  
  it('should not allow unauthorized ballot creation', () => {
    expect(() => createBallot('Unauthorized Ballot', 'This should fail', ['Option 1'], 86400000, 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should close an active ballot', () => {
    const id = createBallot('Closing Ballot', 'A ballot to be closed', ['Yes', 'No'], 86400000, 'CONTRACT_OWNER');
    expect(closeBallot(id, 'CONTRACT_OWNER')).toBe(true);
    expect(ballots.get(id).status).toBe('closed');
  });
  
  it('should not close an already closed ballot', () => {
    const id = createBallot('Already Closed', 'This ballot is already closed', ['A', 'B'], 86400000, 'CONTRACT_OWNER');
    closeBallot(id, 'CONTRACT_OWNER');
    expect(() => closeBallot(id, 'CONTRACT_OWNER')).toThrow('Ballot closed');
  });
  
  it('should not allow unauthorized ballot closing', () => {
    const id = createBallot('Unauthorized Close', 'This should not be closed', ['X', 'Y'], 86400000, 'CONTRACT_OWNER');
    expect(() => closeBallot(id, 'unauthorized_user')).toThrow('Not authorized');
  });
});

