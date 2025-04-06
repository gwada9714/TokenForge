import { User } from "firebase/auth";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: AuthError;
}

export type AuthError = Error & {
  code?: string;
};
