import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
const voters = new Map();
let voterCount = 0;

// Simulated contract functions
function registerVoter(name: string, age: number, quantumKey: string, sender: string) {
  if (voters.has(sender)) throw new Error('Already registered');
  if (age < 18) throw new Error('Invalid voter');
  voters.set(sender, {
    name,
    age,
    registrationTime: Date.now(),
    quantumKey,
    status: 'active'
  });
  voterCount++;
  return true;
}

function updateQuantumKey(newQuantumKey: string, sender: string) {
  if (!voters.has(sender)) throw new Error('Invalid voter');
  const voter = voters.get(sender);
  voter.quantumKey = newQuantumKey;
  voters.set(sender, voter);
  return true;
}

function deactivateVoter(voter: string, sender: string) {
  if (sender !== 'CONTRACT_OWNER') throw new Error('Not authorized');
  if (!voters.has(voter)) throw new Error('Invalid voter');
  const voterData = voters.get(voter);
  voterData.status = 'inactive';
  voters.set(voter, voterData);
  return true;
}

describe('Voter Registration Contract', () => {
  beforeEach(() => {
    voters.clear();
    voterCount = 0;
  });
  
  it('should register a new voter', () => {
    expect(registerVoter('Alice', 25, 'quantum_key_1', 'alice_address')).toBe(true);
    expect(voters.size).toBe(1);
    expect(voterCount).toBe(1);
  });
  
  it('should not register an underage voter', () => {
    expect(() => registerVoter('Bob', 17, 'quantum_key_2', 'bob_address')).toThrow('Invalid voter');
  });
  
  it('should not register a voter twice', () => {
    registerVoter('Charlie', 30, 'quantum_key_3', 'charlie_address');
    expect(() => registerVoter('Charlie', 30, 'quantum_key_4', 'charlie_address')).toThrow('Already registered');
  });
  
  it('should update quantum key', () => {
    registerVoter('David', 40, 'quantum_key_5', 'david_address');
    expect(updateQuantumKey('new_quantum_key', 'david_address')).toBe(true);
    expect(voters.get('david_address').quantumKey).toBe('new_quantum_key');
  });
  
  it('should deactivate a voter', () => {
    registerVoter('Eve', 35, 'quantum_key_6', 'eve_address');
    expect(deactivateVoter('eve_address', 'CONTRACT_OWNER')).toBe(true);
    expect(voters.get('eve_address').status).toBe('inactive');
  });
  
  it('should not allow unauthorized deactivation', () => {
    registerVoter('Frank', 50, 'quantum_key_7', 'frank_address');
    expect(() => deactivateVoter('frank_address', 'unauthorized_user')).toThrow('Not authorized');
  });
});

