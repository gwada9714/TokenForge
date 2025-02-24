import { AuthErrorCode } from '../errors/AuthError';
import { errorService } from './errorService';
import { logService } from './logService';

const LOG_CATEGORY = 'ConfigService';

class ConfigService {
  private config: Record<string, any> = {};

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      // Chargement de la configuration depuis l'environnement
      this.config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      };

      logService.info(LOG_CATEGORY, 'Configuration loaded successfully');
    } catch (error) {
      logService.error(LOG_CATEGORY, 'Failed to load configuration', { 
        details: error instanceof Error ? error.message : String(error)
      });
      throw errorService.createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        'Failed to load configuration'
      );
    }
  }

  getConfig<T>(key: string): T {
    try {
      const value = this.config[key];
      if (value === undefined) {
        throw errorService.createAuthError(
          AuthErrorCode.INTERNAL_ERROR,
          `Configuration key not found: ${key}`
        );
      }
      return value as T;
    } catch (error) {
      logService.error(LOG_CATEGORY, 'Failed to get configuration value', { 
        key,
        details: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  setConfig<T>(key: string, value: T): void {
    try {
      this.config[key] = value;
      logService.info(LOG_CATEGORY, 'Configuration value set successfully', { key });
    } catch (error) {
      logService.error(LOG_CATEGORY, 'Failed to set configuration value', { 
        key,
        details: error instanceof Error ? error.message : String(error)
      });
      throw errorService.createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        `Failed to set configuration value for key: ${key}`
      );
    }
  }
}

export const configService = new ConfigService();
