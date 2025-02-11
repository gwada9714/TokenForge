import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AuthError } from '../features/auth/errors/AuthError';
import { logger, LogLevel } from '../utils/firebase-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.log(LogLevel.ERROR, 'Erreur capturée par AuthErrorBoundary:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString()
    });

    if (error instanceof AuthError) {
      // Envoyer l'erreur à notre service de monitoring
      this.reportAuthError(error);
    }
  }

  private reportAuthError(error: AuthError): void {
    const errorDetails = {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // TODO: Implémenter l'envoi à un service de monitoring
    console.error('Auth Error:', errorDetails);
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="auth-error-boundary">
          <h2>Une erreur est survenue</h2>
          <p>Nous nous excusons pour ce désagrément.</p>
          {this.state.error instanceof AuthError && (
            <div className="error-details">
              <p>{this.state.error.message}</p>
              <button onClick={this.handleRetry}>Réessayer</button>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
