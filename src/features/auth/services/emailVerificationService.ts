import { User as FirebaseUser, sendEmailVerification } from 'firebase/auth';
import { AuthError } from '../errors/AuthError';
import { errorService } from './errorService';
import { notificationService } from './notificationService';
import { logService } from './logService';
import { retryService } from './retryService';

const LOG_CATEGORY = 'EmailVerificationService';

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
      logService.info(LOG_CATEGORY, 'Sending verification email', { userEmail: user.email });
      
      if (!user.emailVerified) {
        await retryService.withRetry(
          async () => {
            await sendEmailVerification(user);
          },
          {
            maxAttempts: 3,
            initialDelay: 1000
          }
        );
        
        notificationService.success('Email de vérification envoyé');
        logService.info(LOG_CATEGORY, 'Verification email sent successfully', { userEmail: user.email });
      } else {
        logService.info(LOG_CATEGORY, 'Email already verified', { userEmail: user.email });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logService.error(
        LOG_CATEGORY,
        'Failed to send verification email',
        err,
        { status: 'send_failed', userEmail: user.email }
      );
      throw errorService.handleError(error);
    }
  }

  async checkEmailVerification(user: FirebaseUser): Promise<void> {
    try {
      logService.debug(LOG_CATEGORY, 'Checking email verification status', { userEmail: user.email });
      
      // Recharger l'utilisateur pour obtenir le statut le plus récent
      await user.reload();
      
      if (!user.emailVerified) {
        const error = new AuthError(
          AuthError.CODES.EMAIL_NOT_VERIFIED,
          'Email non vérifié',
          { 
            email: user.email,
            type: 'email-not-verified'
          }
        );
        logService.warn(
          LOG_CATEGORY,
          'Email not verified',
          { status: 'pending', userEmail: user.email },
          error
        );
        throw error;
      }
      
      logService.info(LOG_CATEGORY, 'Email verified successfully', { status: 'success', userEmail: user.email });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logService.error(
        LOG_CATEGORY,
        'Error checking email verification',
        err,
        { status: 'error', userEmail: user.email }
      );
      throw errorService.handleError(error);
    }
  }

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

    logService.info(LOG_CATEGORY, 'Starting email verification wait', {
      userEmail: user.email,
      intervalMs,
      timeoutMs
    });

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkVerification = async () => {
        try {
          await user.reload();
          
          if (user.emailVerified) {
            logService.info(LOG_CATEGORY, 'Email verification confirmed', { status: 'success', userEmail: user.email });
            notificationService.success('Email vérifié avec succès');
            onVerified?.();
            resolve();
            return;
          }

          const elapsedTime = Date.now() - startTime;
          if (elapsedTime > timeoutMs) {
            const error = new AuthError(
              AuthError.CODES.EMAIL_VERIFICATION_TIMEOUT,
              'Le délai de vérification de l\'email a expiré',
              { 
                email: user.email,
                type: 'verification-timeout',
                elapsedTime
              }
            );
            logService.error(
              LOG_CATEGORY,
              'Email verification timeout',
              error,
              { status: 'timeout', userEmail: user.email, elapsedTime }
            );
            notificationService.error('Le délai de vérification a expiré');
            reject(error);
            return;
          }

          logService.debug(LOG_CATEGORY, 'Verification check - email not yet verified', {
            status: 'pending',
            userEmail: user.email,
            elapsedTime,
            nextCheckIn: intervalMs
          });

          setTimeout(checkVerification, intervalMs);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logService.error(
            LOG_CATEGORY,
            'Error during verification check',
            err,
            { status: 'error', userEmail: user.email }
          );
          reject(errorService.handleError(error));
        }
      };

      checkVerification();
    });
  }
}

export const emailVerificationService = EmailVerificationService.getInstance();
