import { AuthErrorCodes } from "firebase/auth";
import { errorService } from "../services/errorService";
import { logService } from "../services/logService";

const LOG_CATEGORY = "FirebaseErrors";

export const firebaseErrorMap = {
  [AuthErrorCodes.INVALID_EMAIL]: "INVALID_EMAIL",
  [AuthErrorCodes.USER_DISABLED]: "USER_DISABLED",
  [AuthErrorCodes.USER_DELETED]: "USER_NOT_FOUND",
  [AuthErrorCodes.INVALID_PASSWORD]: "WRONG_PASSWORD",
  [AuthErrorCodes.EMAIL_EXISTS]: "EMAIL_ALREADY_IN_USE",
  [AuthErrorCodes.OPERATION_NOT_ALLOWED]: "OPERATION_NOT_ALLOWED",
  [AuthErrorCodes.WEAK_PASSWORD]: "WEAK_PASSWORD",
  [AuthErrorCodes.INVALID_APP_CREDENTIAL]: "INVALID_CREDENTIAL",
  [AuthErrorCodes.INVALID_OOB_CODE]: "INVALID_VERIFICATION_CODE",
  [AuthErrorCodes.INVALID_IDP_RESPONSE]: "INVALID_SESSION_INFO",
  [AuthErrorCodes.EXPIRED_OOB_CODE]: "REQUIRES_RECENT_LOGIN",
  [AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER]: "TOO_MANY_ATTEMPTS_TRY_LATER",
  [AuthErrorCodes.NETWORK_REQUEST_FAILED]: "NETWORK_ERROR",
  [AuthErrorCodes.INTERNAL_ERROR]: "INTERNAL_ERROR",
  [AuthErrorCodes.TIMEOUT]: "TIMEOUT",
} as const;

export type FirebaseErrorCode = keyof typeof firebaseErrorMap;
export type AuthErrorCode = (typeof firebaseErrorMap)[FirebaseErrorCode];

export function mapFirebaseError(error: Error & { code?: string }): Error {
  const code = error.code;
  if (!code) return error;

  const mappedCode = firebaseErrorMap[code as FirebaseErrorCode];
  if (!mappedCode) return error;

  logService.debug(LOG_CATEGORY, "Mapped Firebase error", {
    originalCode: code,
    mappedCode: mappedCode,
  });

  return errorService.createAuthError(mappedCode, error.message);
}

export function isFirebaseError(
  error: unknown
): error is { code?: string; message: string } {
  return error instanceof Error && "code" in error;
}

export function handleAuthError(error: unknown) {
  if (isFirebaseError(error)) {
    return mapFirebaseError(error);
  }

  logService.error(LOG_CATEGORY, "Unknown error type", { error });
  return errorService.createAuthError(
    "UNKNOWN_ERROR",
    "Une erreur inconnue est survenue."
  );
}
