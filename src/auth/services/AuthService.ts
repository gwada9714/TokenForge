import { Auth, getAuth, User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from '@/config/firebase';
import { logger } from '@/core/logger/BaseLogger';
import { AuthError } from '@/core/types/errors';
import type { LoginCredentials, AuthResponse } from '../types/auth.types';

export class AuthService {
  private static instance: AuthService;
  private auth: Auth;
  private readonly TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000;

  private constructor() {
    this.auth = getAuth(app);
    this.setupAuthListeners();
  }

  private setupAuthListeners(): void {
    this.auth.onAuthStateChanged(
      (user) => this.handleAuthStateChange(user),
      (error) => this.handleAuthError(error)
    );
  }

  private async handleAuthStateChange(user: User | null): Promise<void> {
    if (user) {
      await this.setupTokenRefresh(user);
    }
  }

  private async setupTokenRefresh(user: User): Promise<void> {
    try {
      await user.getIdToken(true);
      setInterval(async () => {
        await user.getIdToken(true);
      }, this.TOKEN_REFRESH_INTERVAL);
    } catch (error) {
      logger.error({
        message: 'Token refresh failed',
        error
      });
    }
  }

  private handleAuthError(error: Error): void {
    logger.error({
      message: 'Auth state change error',
      error
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      logger.info({
        category: 'AuthService',
        message: 'User logged in successfully',
        metadata: { 
          uid: userCredential.user.uid,
          service: 'AuthService'
        }
      });

      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      const authError = new AuthError('LOGIN_FAILED', 'Failed to login');
      logger.error({
        category: 'AuthService',
        message: 'Login failed',
        error: authError,
        metadata: {
          service: 'AuthService'
        }
      });
      return {
        success: false,
        error: authError
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      logger.error({
        category: 'AuthService',
        message: 'Logout failed',
        error
      });
      throw error;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.auth.onAuthStateChanged(callback);
  }
}

export const authService = AuthService.getInstance();
