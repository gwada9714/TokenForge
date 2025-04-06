import { FirebaseError } from "firebase/app";
import { AuthError, AuthErrorCode } from "../errors/AuthError";
import { captureException } from "../../../config/sentry";
import { logger } from "../../../core/logger";

const LOG_CATEGORY = "ErrorService";

export class ErrorService {
  private static errorMap: Record<string, AuthErrorCode> = {
    "auth/user-not-found": AuthErrorCode.USER_NOT_FOUND,
    "auth/wrong-password": AuthErrorCode.INVALID_PASSWORD,
    "auth/email-already-in-use": AuthErrorCode.EMAIL_IN_USE,
    "auth/invalid-email": AuthErrorCode.INVALID_EMAIL,
    "auth/weak-password": AuthErrorCode.WEAK_PASSWORD,
    "auth/user-disabled": AuthErrorCode.USER_DISABLED,
    "auth/requires-recent-login": AuthErrorCode.REQUIRES_RECENT_LOGIN,
    "auth/invalid-credential": AuthErrorCode.INVALID_CREDENTIAL,
    "auth/operation-not-allowed": AuthErrorCode.OPERATION_NOT_ALLOWED,
    "auth/account-exists-with-different-credential":
      AuthErrorCode.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL,
  };

  public static handleFirebaseAuthError(error: FirebaseError): AuthError {
    const code = this.errorMap[error.code] || AuthErrorCode.INTERNAL_ERROR;
    const message = this.getErrorMessage(code);

    logger.error(LOG_CATEGORY, "Firebase auth error", {
      code: error.code,
      message: error.message,
      mappedCode: code,
    });

    captureException(error, {
      errorCode: code,
      originalCode: error.code,
      context: "Firebase Authentication",
    });

    return new AuthError(code, message, error);
  }

  public static createAuthError(
    code: AuthErrorCode,
    message: string,
    originalError?: Error
  ): AuthError {
    const error = new AuthError(code, message, originalError);

    logger.error(LOG_CATEGORY, "Auth error created", {
      code,
      message,
      originalError,
    });

    captureException(error, {
      errorCode: code,
      context: "Custom Authentication Error",
    });

    return error;
  }

  private static getErrorMessage(code: AuthErrorCode): string {
    switch (code) {
      case AuthErrorCode.USER_NOT_FOUND:
        return "Aucun utilisateur trouvé avec ces identifiants";
      case AuthErrorCode.INVALID_PASSWORD:
        return "Mot de passe incorrect";
      case AuthErrorCode.EMAIL_IN_USE:
        return "Cette adresse email est déjà utilisée";
      case AuthErrorCode.INVALID_EMAIL:
        return "Adresse email invalide";
      case AuthErrorCode.WEAK_PASSWORD:
        return "Le mot de passe doit contenir au moins 6 caractères";
      case AuthErrorCode.USER_DISABLED:
        return "Ce compte a été désactivé";
      case AuthErrorCode.REQUIRES_RECENT_LOGIN:
        return "Cette opération nécessite une connexion récente. Veuillez vous reconnecter";
      case AuthErrorCode.INVALID_CREDENTIAL:
        return "Les identifiants fournis sont invalides";
      case AuthErrorCode.OPERATION_NOT_ALLOWED:
        return "Cette opération n'est pas autorisée";
      case AuthErrorCode.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL:
        return "Un compte existe déjà avec une autre méthode de connexion";
      default:
        return "Une erreur inattendue est survenue";
    }
  }
}

export const errorService = new ErrorService();
