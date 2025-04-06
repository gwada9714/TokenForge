// Exporter les types et services d'erreur
export * from './ErrorService';

// Fonction utilitaire pour gérer les erreurs
import { errorService, ErrorCode, ErrorSeverity } from './ErrorService';

/**
 * Fonction utilitaire pour gérer les erreurs en dehors des composants React
 */
export function handleGlobalError(
  errorOrCode: unknown | ErrorCode,
  message?: string,
  severity?: ErrorSeverity,
  context?: Record<string, unknown>
) {
  return errorService.handleError(errorOrCode, message, severity, context);
}
