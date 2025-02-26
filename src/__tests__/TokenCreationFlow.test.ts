import { describe, it, expect, vi } from 'vitest';
import { mockPublicClient, mockWalletClient } from '../mocks/clients';

vi.mock('viem', () => ({
  createPublicClient: () => mockPublicClient,
  createWalletClient: () => mockWalletClient,
  parseEther: (value: string) => BigInt(value) * BigInt(10 ** 18),
}));

describe('Token Creation Flow', () => {
  it('should create a new token successfully', async () => {
    // Test à implémenter
    expect(true).toBe(true);
  });
}); 