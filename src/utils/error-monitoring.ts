import * as Sentry from '@sentry/react';
import { logger } from './firebase-logger';

const LOG_CATEGORY = 'Error Monitoring';

interface CspViolation {
  'csp-report': {
    'document-uri': string;
    'violated-directive': string;
    'blocked-uri': string;
    'line-number': number;
    'column-number': number;
    'source-file': string;
  };
}

export class ErrorMonitoring {
  private static instance: ErrorMonitoring;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): ErrorMonitoring {
    if (!ErrorMonitoring.instance) {
      ErrorMonitoring.instance = new ErrorMonitoring();
    }
    return ErrorMonitoring.instance;
  }

  public initialize(): void {
    if (this.isInitialized) return;

    try {
      // Configuration des listeners CSP
      if (import.meta.env.VITE_CSP_REPORT_URI) {
        document.addEventListener('securitypolicyviolation', (e: SecurityPolicyViolationEvent) => {
          this.handleCspViolation({
            'csp-report': {
              'document-uri': e.documentURI,
              'violated-directive': e.violatedDirective,
              'blocked-uri': e.blockedURI,
              'line-number': e.lineNumber,
              'column-number': e.columnNumber,
              'source-file': e.sourceFile
            }
          });
        });
      }

      // Configuration de Sentry
      if (import.meta.env.VITE_ERROR_REPORTING_ENABLED === 'true') {
        Sentry.init({
          dsn: import.meta.env.VITE_SENTRY_DSN,
          environment: import.meta.env.VITE_ENV,
          release: import.meta.env.VITE_SW_VERSION,
          tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_SAMPLE_RATE || '0.1'),
          beforeSend: (event) => {
            if (import.meta.env.VITE_ENV === 'development') {
              console.log('Sentry Event:', event);
              return null;
            }
            return event;
          }
        });
      }

      this.isInitialized = true;
      logger.info(LOG_CATEGORY, 'Error monitoring initialized successfully');
    } catch (error) {
      logger.error(LOG_CATEGORY, 'Failed to initialize error monitoring', error);
    }
  }

  private async handleCspViolation(violation: CspViolation): Promise<void> {
    try {
      // Log local de la violation
      logger.warn(LOG_CATEGORY, 'CSP Violation detected', violation);

      // Envoi à Sentry si activé
      if (import.meta.env.VITE_ERROR_REPORTING_ENABLED === 'true') {
        Sentry.captureMessage('CSP Violation', {
          level: 'warning',
          extra: violation
        });
      }

      // Envoi au point de terminaison de rapport si configuré
      if (import.meta.env.VITE_CSP_REPORT_URI) {
        await fetch(import.meta.env.VITE_CSP_REPORT_URI, {
          method: 'POST',
          body: JSON.stringify(violation),
          headers: {
            'Content-Type': 'application/csp-report'
          }
        });
      }
    } catch (error) {
      logger.error(LOG_CATEGORY, 'Failed to handle CSP violation', error);
    }
  }

  public captureError(error: Error, context?: Record<string, any>): void {
    try {
      logger.error(LOG_CATEGORY, error.message, { error, context });

      if (import.meta.env.VITE_ERROR_REPORTING_ENABLED === 'true') {
        Sentry.captureException(error, {
          extra: context
        });
      }
    } catch (e) {
      logger.error(LOG_CATEGORY, 'Failed to capture error', e);
    }
  }

  public setUser(userId: string | null, email?: string): void {
    if (import.meta.env.VITE_ERROR_REPORTING_ENABLED === 'true') {
      if (userId) {
        Sentry.setUser({ id: userId, email });
      } else {
        Sentry.setUser(null);
      }
    }
  }
}
