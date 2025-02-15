import { Auth, User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseManager } from '@/services/firebase';
import { logger } from '@/core/logger/BaseLogger';
import { AuthError } from '@/core/types/errors';
import type { LoginCredentials, AuthResponse } from '../types/auth.types';

export class AuthService {
  private static instance: AuthService | null = null;
  private auth: Auth;
  private readonly TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000;

  private constructor() {
    this.auth = firebaseManager.getAuth();
    this.setupTokenRefresh();
  }

  static getInstance(): AuthService {
    if (!this.instance) {
      this.instance = new AuthService();
    }
    return this.instance;
  }

  private async getAuth(): Promise<Auth> {
    if (!this.auth) {
      this.auth = await firebaseManager.getAuth();
    }
    return this.auth;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const auth = await this.getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
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
      const auth = await this.getAuth();
      await signOut(auth);
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
    const auth = firebaseManager.getAuth(); // Correction : utilisation de firebaseManager au lieu de firebaseService
    return auth.onAuthStateChanged(callback);
  }
}

export const authService = AuthService.getInstance();
