import { User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export type AuthError = Error & {
  code?: string;
};
