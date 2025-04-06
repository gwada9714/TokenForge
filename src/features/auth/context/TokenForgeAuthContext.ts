import { createContext } from "react";
import { TokenForgeAuthState } from "../types/auth";
import { AuthAction } from "../actions/authActions";
import { TokenForgeAuthActions } from "../actions/authActions"; // Assuming this type exists
import { Partial, TokenForgeUser } from "../types/user"; // Assuming this type exists

interface TokenForgeAuthContextType extends TokenForgeAuthState {
  dispatch: React.Dispatch<AuthAction>;
  state: TokenForgeAuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  updateUser: (updates: Partial<TokenForgeUser>) => Promise<void>;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => Promise<void>;
  clearError: () => void;
  actions: TokenForgeAuthActions;
  validateAdminAccess: () => boolean;
}

export const TokenForgeAuthContext =
  createContext<TokenForgeAuthContextType | null>(null);
