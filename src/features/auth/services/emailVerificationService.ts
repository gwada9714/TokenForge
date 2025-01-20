import { User as FirebaseUser, sendEmailVerification } from 'firebase/auth';
import { AuthError } from '../errors/AuthError';
import { errorService } from './errorService';
import { ErrorCode } from '../types';

export class EmailVerificationService {
  private static instance: EmailVerificationService;
  
  private constructor() {}

  static getInstance(): EmailVerificationService {
    if (!EmailVerificationService.instance) {
      EmailVerificationService.instance = new EmailVerificationService();
    }
    return EmailVerificationService.instance;
  }

  async sendVerificationEmail(user: FirebaseUser): Promise<void> {
    try {
      if (!user.emailVerified) {
        await sendEmailVerification(user);
      }
    } catch (error) {
      throw errorService.handleError(error);
    }
  }

  async checkEmailVerification(user: FirebaseUser): Promise<void> {
    try {
      // Recharger l'utilisateur pour obtenir le statut le plus récent
      await user.reload();
      
      if (!user.emailVerified) {
        throw new AuthError(
          'AUTH_005' as ErrorCode, // Utilisation du code Firebase error générique
          'Email non vérifié',
          { 
            email: user.email,
            type: 'email-not-verified'
          }
        );
      }
    } catch (error) {
      throw errorService.handleError(error);
    }
  }

  // Vérifie périodiquement si l'email a été vérifié
  async waitForEmailVerification(
    user: FirebaseUser,
    options: {
      intervalMs?: number;
      timeoutMs?: number;
      onVerified?: () => void;
    } = {}
  ): Promise<void> {
    const {
      intervalMs = 2000,
      timeoutMs = 300000, // 5 minutes par défaut
      onVerified
    } = options;

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkVerification = async () => {
        try {
          await user.reload();
          
          if (user.emailVerified) {
            onVerified?.();
            resolve();
            return;
          }

          if (Date.now() - startTime > timeoutMs) {
            reject(new AuthError(
              'AUTH_005' as ErrorCode, // Utilisation du code Firebase error générique
              'Le délai de vérification de l\'email a expiré',
              { 
                email: user.email,
                type: 'verification-timeout'
              }
            ));
            return;
          }

          setTimeout(checkVerification, intervalMs);
        } catch (error) {
          reject(errorService.handleError(error));
        }
      };

      checkVerification();
    });
  }
}

export const emailVerificationService = EmailVerificationService.getInstance();
