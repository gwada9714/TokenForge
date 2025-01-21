import { User } from 'firebase/auth';

export interface AuthSession {
  currentUser: User;
  token: string;
  refreshToken: string;
  expiresAt: number;
}
