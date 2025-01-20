import type { AuthSession } from '../firebaseAuth';

export const signInWithGoogle = jest.fn(async (): Promise<AuthSession> => ({
  uid: 'test-uid',
  email: 'test@example.com',
  emailVerified: true,
  provider: 'google',
}));

export const signInWithWallet = jest.fn(async (address: string): Promise<AuthSession> => ({
  uid: 'test-uid',
  email: `${address}@wallet.com`,
  emailVerified: true,
  provider: 'wallet',
}));

export const signOut = jest.fn(async () => {});

export const sendVerificationEmail = jest.fn(async () => {});

export const refreshSession = jest.fn(async () => {});
