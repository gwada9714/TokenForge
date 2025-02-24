import { toast } from 'react-toastify';

type ErrorType = 'auth' | 'network' | 'transaction' | 'validation' | 'unknown';

interface ErrorDetails {
  code?: string;
  message: string;
  type: ErrorType;
  data?: unknown;
}

class ErrorService {
  private static instance: ErrorService;

  private constructor() {}

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  handleError(error: Error | ErrorDetails): void {
    const errorDetails = this.normalizeError(error);
    this.logError(errorDetails);
    this.showErrorToUser(errorDetails);
  }

  private normalizeError(error: Error | ErrorDetails): ErrorDetails {
    if ('type' in error) {
      return error as ErrorDetails;
    }

    // Analyse de l'erreur pour déterminer son type
    const errorMessage = error.message.toLowerCase();
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return {
        type: 'network',
        message: 'Erreur de connexion réseau. Veuillez vérifier votre connexion internet.',
        data: error
      };
    }

    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
      return {
        type: 'auth',
        message: 'Erreur d\'authentification. Veuillez vous reconnecter.',
        data: error
      };
    }

    if (errorMessage.includes('transaction')) {
      return {
        type: 'transaction',
        message: 'Erreur lors de la transaction. Veuillez réessayer.',
        data: error
      };
    }

    return {
      type: 'unknown',
      message: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
      data: error
    };
  }

  private logError(error: ErrorDetails): void {
    console.error('[TokenForge Error]:', {
      type: error.type,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      data: error.data
    });
  }

  private showErrorToUser(error: ErrorDetails): void {
    const messages: Record<ErrorType, string> = {
      auth: 'Erreur d\'authentification',
      network: 'Erreur de connexion',
      transaction: 'Erreur de transaction',
      validation: 'Erreur de validation',
      unknown: 'Erreur inattendue'
    };

    toast.error(error.message, {
      toastId: `error-${error.type}-${Date.now()}`,
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }
}

export const errorService = ErrorService.getInstance();
