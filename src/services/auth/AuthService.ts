import { BaseService } from '@/core/services/BaseService';
import { FirebaseService } from '../firebase/FirebaseService';
import { User } from 'firebase/auth';
import { AuthError } from '@/types/errors';

export class AuthService extends BaseService {
  private firebaseService: FirebaseService;
  private refreshTokenInterval?: NodeJS.Timeout;
  private readonly TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000;

  constructor(firebaseService: FirebaseService) {
    super('AuthService');
    this.firebaseService = firebaseService;
  }

  async initialize(): Promise<void> {
    try {
      const auth = this.firebaseService.getAuth();
      this.setupAuthStateListener(auth);
      this.log('Auth service initialized');
    } catch (error) {
      this.logError('Auth service initialization failed', error as Error);
      throw error;
    }
  }

  private setupAuthStateListener(auth: Auth): void {
    auth.onAuthStateChanged(
      (user) => this.handleAuthStateChange(user),
      (error) => this.logError('Auth state change error', error)
    );
  }

  private async handleAuthStateChange(user: User | null): Promise<void> {
    if (user) {
      await this.setupTokenRefresh(user);
      this.log('User authenticated', { userId: user.uid });
    } else {
      this.clearTokenRefresh();
      this.log('User signed out');
    }
  }

  // ... rest of the implementation ...

  async cleanup(): Promise<void> {
    this.clearTokenRefresh();
    this.log('Auth service cleaned up');
  }
}

export const authService = AuthService.getInstance();
