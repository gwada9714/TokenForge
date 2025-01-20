import { vi } from 'vitest';
import type { AuthSession } from '../firebaseAuth';

export const signInWithGoogle = vi.fn(async (): Promise<AuthSession> => ({
  uid: 'test-uid',
  email: 'test@example.com',
  emailVerified: true,
  provider: 'google',
}));

export const signInWithWallet = vi.fn(async (address: string): Promise<AuthSession> => ({
  uid: 'test-uid',
  email: `${address}@wallet.com`,
  emailVerified: true,
  provider: 'wallet',
}));

export const signOut = vi.fn(async () => {});

export const sendVerificationEmail = vi.fn(async () => {});

export const refreshSession = vi.fn(async () => {});
