import { toast } from '@/components/ui/toast';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorDetails {
  code: string;
  message: string;
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
}

class ErrorService {
  private static instance: ErrorService;
  private errorListeners: ((error: ErrorDetails) => void)[] = [];

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  handleError(error: unknown, context?: Record<string, unknown>): ErrorDetails {
    const errorDetails = this.normalizeError(error, context);
    
    // Notifier les listeners
    this.errorListeners.forEach(listener => listener(errorDetails));

    // Afficher une notification UI
    toast({
      title: this.getErrorTitle(errorDetails.code),
      description: errorDetails.message,
      variant: errorDetails.severity === 'error' ? 'destructive' : 'default'
    });

    // Logger l'erreur pour le debugging
    if (errorDetails.severity === 'error') {
      console.error('TokenForge Error:', errorDetails);
    }

    return errorDetails;
  }

  addErrorListener(listener: (error: ErrorDetails) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  private normalizeError(error: unknown, context?: Record<string, unknown>): ErrorDetails {
    if (error instanceof Error) {
      return {
        code: 'INTERNAL_ERROR',
        message: error.message,
        severity: 'error',
        context
      };
    }

    if (typeof error === 'string') {
      return {
        code: 'GENERIC_ERROR',
        message: error,
        severity: 'error',
        context
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'Une erreur inattendue est survenue',
      severity: 'error',
      context: { rawError: error, ...context }
    };
  }

  private getErrorTitle(code: string): string {
    const titles: Record<string, string> = {
      'INTERNAL_ERROR': 'Erreur Interne',
      'GENERIC_ERROR': 'Erreur',
      'UNKNOWN_ERROR': 'Erreur Inattendue',
      'CONTRACT_DEPLOYMENT_ERROR': 'Erreur de Déploiement',
      'NETWORK_ERROR': 'Erreur Réseau',
      'INSUFFICIENT_FUNDS': 'Fonds Insuffisants',
      'PERMISSION_DENIED': 'Permission Refusée'
    };

    return titles[code] || 'Erreur';
  }
}
