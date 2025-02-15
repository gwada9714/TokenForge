import { Auth, User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfig } from '../../config/firebase.config';

export class AuthService {
  private static instance: AuthService | null = null;
  private auth: Auth;
  private readonly TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes

  private constructor() {
    this.auth = firebaseConfig.getAuth();
    this.setupTokenRefresh();
  }

  // ...existing code...

  async login(email: string, password: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      await result.user.getIdToken(true);
      return result.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }
}

export const authService = AuthService.getInstance();
