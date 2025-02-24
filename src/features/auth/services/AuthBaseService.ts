import { BaseSingletonService } from '@/services/BaseService';
import { Auth } from 'firebase/auth';
import { errorHandler } from '@/utils/errors';

export abstract class AuthBaseService extends BaseSingletonService<AuthBaseService> {
  protected auth: Auth | null = null;
  protected readonly TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000;

  protected setupAuthStateListener(auth: Auth): void {
    auth.onAuthStateChanged(
      (user) => this.handleAuthStateChange(user),
      (error) => errorHandler.handleError(error, 'Auth')
    );
  }

  protected abstract handleAuthStateChange(user: User | null): Promise<void>;
}
