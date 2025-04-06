export class FirebaseError extends Error {
  constructor(
    public code: string,
    message: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "FirebaseError";
  }

  toLog(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack,
      timestamp: new Date(),
    };
  }
}

// Interface pour les options de contexte d'erreur
export interface ErrorHandlerOptions {
  operation?: string;
  resource?: string;
  resourceId?: string;
  additionalContext?: Record<string, unknown>;
}

/**
 * Gère les erreurs Firebase et les convertit en instances de FirebaseError
 * avec des informations supplémentaires utiles pour le débogage
 */
export const handleFirebaseError = (
  error: unknown,
  options?: ErrorHandlerOptions
): FirebaseError => {
  // Si c'est déjà une FirebaseError, on la retourne telle quelle
  if (error instanceof FirebaseError) {
    return error;
  }

  // Contexte par défaut
  const context: Record<string, unknown> = {
    ...(options?.additionalContext || {}),
    timestamp: new Date(),
  };

  // Ajouter des informations de contexte si disponibles
  if (options?.operation) {
    context.operation = options.operation;
  }

  if (options?.resource) {
    context.resource = options.resource;
  }

  if (options?.resourceId) {
    context.resourceId = options.resourceId;
  }

  // Traiter les erreurs Firebase natives
  if (error instanceof Error && "code" in error) {
    const firebaseError = error as Error & { code: string };
    const errorCode = firebaseError.code;

    // Mapper les codes d'erreur Firebase vers des messages plus explicites
    let userFriendlyMessage = firebaseError.message;

    // Erreurs d'authentification
    if (errorCode.startsWith("auth/")) {
      switch (errorCode) {
        case "auth/email-already-in-use":
          userFriendlyMessage =
            "Cette adresse e-mail est déjà utilisée par un autre compte.";
          break;
        case "auth/invalid-email":
          userFriendlyMessage = "L'adresse e-mail n'est pas valide.";
          break;
        case "auth/user-disabled":
          userFriendlyMessage = "Ce compte utilisateur a été désactivé.";
          break;
        case "auth/user-not-found":
          userFriendlyMessage =
            "Aucun compte ne correspond à cette adresse e-mail.";
          break;
        case "auth/wrong-password":
          userFriendlyMessage = "Le mot de passe est incorrect.";
          break;
        case "auth/weak-password":
          userFriendlyMessage =
            "Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.";
          break;
        case "auth/requires-recent-login":
          userFriendlyMessage =
            "Cette opération est sensible et nécessite une authentification récente. Veuillez vous reconnecter.";
          break;
        default:
          userFriendlyMessage = `Erreur d'authentification: ${firebaseError.message}`;
      }
    }

    // Erreurs Firestore
    else if (errorCode.startsWith("firestore/")) {
      switch (errorCode) {
        case "firestore/permission-denied":
          userFriendlyMessage =
            "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.";
          break;
        case "firestore/not-found":
          userFriendlyMessage = "Le document demandé n'existe pas.";
          break;
        case "firestore/already-exists":
          userFriendlyMessage =
            "Le document que vous essayez de créer existe déjà.";
          break;
        case "firestore/failed-precondition":
          userFriendlyMessage =
            "L'opération a échoué car les conditions préalables ne sont pas remplies.";
          break;
        case "firestore/cancelled":
          userFriendlyMessage = "L'opération a été annulée.";
          break;
        case "firestore/data-loss":
          userFriendlyMessage = "Des données ont été perdues ou corrompues.";
          break;
        case "firestore/deadline-exceeded":
          userFriendlyMessage =
            "L'opération a pris trop de temps à s'exécuter.";
          break;
        case "firestore/resource-exhausted":
          userFriendlyMessage = "Les ressources système sont épuisées.";
          break;
        case "firestore/unavailable":
          userFriendlyMessage =
            "Le service Firestore est temporairement indisponible. Veuillez réessayer plus tard.";
          break;
        default:
          userFriendlyMessage = `Erreur Firestore: ${firebaseError.message}`;
      }
    }

    // Erreurs de stockage
    else if (errorCode.startsWith("storage/")) {
      switch (errorCode) {
        case "storage/object-not-found":
          userFriendlyMessage = "Le fichier demandé n'existe pas.";
          break;
        case "storage/unauthorized":
          userFriendlyMessage =
            "Vous n'avez pas les autorisations nécessaires pour accéder à ce fichier.";
          break;
        case "storage/canceled":
          userFriendlyMessage = "L'opération a été annulée par l'utilisateur.";
          break;
        case "storage/quota-exceeded":
          userFriendlyMessage = "Le quota de stockage a été dépassé.";
          break;
        default:
          userFriendlyMessage = `Erreur de stockage: ${firebaseError.message}`;
      }
    }

    return new FirebaseError(errorCode, userFriendlyMessage, {
      ...context,
      originalError: firebaseError.name,
      originalMessage: firebaseError.message,
      stack: firebaseError.stack,
    });
  }

  // Traiter les erreurs JavaScript standard
  if (error instanceof Error) {
    return new FirebaseError("UNKNOWN_ERROR", error.message, {
      ...context,
      originalError: error.name,
      stack: error.stack,
    });
  }

  // Traiter les erreurs non-Error
  return new FirebaseError(
    "UNEXPECTED_ERROR",
    "Une erreur inattendue est survenue",
    {
      ...context,
      error,
    }
  );
};
