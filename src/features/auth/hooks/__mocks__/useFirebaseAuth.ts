import type { AuthSession } from "../../services/firebaseAuth";

export const useFirebaseAuth = jest.fn(() => ({
  session: null as AuthSession | null,
  isLoading: false,
  error: null as Error | null,
  signInWithGoogle: jest.fn(),
  signInWithWallet: jest.fn(),
  signOut: jest.fn(),
  sendVerificationEmail: jest.fn(),
  refreshSession: jest.fn(),
}));
