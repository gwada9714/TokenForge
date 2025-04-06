export type ErrorCode =
  | "AUTH_001" // WALLET_NOT_FOUND
  | "AUTH_002" // NETWORK_MISMATCH
  | "AUTH_003" // INVALID_SIGNATURE
  | "AUTH_004" // SESSION_EXPIRED
  | "AUTH_005" // FIREBASE_ERROR
  | "AUTH_006" // TWO_FACTOR_REQUIRED
  | "AUTH_007" // TWO_FACTOR_INVALID
  | "AUTH_008" // WALLET_DISCONNECTED
  | "AUTH_009" // PROVIDER_ERROR
  | "AUTH_010" // EMAIL_NOT_VERIFIED
  | "AUTH_011" // EMAIL_VERIFICATION_TIMEOUT
  | "AUTH_012" // NO_USER
  | "AUTH_013" // STORAGE_ERROR
  | "AUTH_014" // USER_NOT_FOUND
  | "AUTH_015" // OPERATION_NOT_ALLOWED
  | "AUTH_016" // INVALID_CREDENTIALS
  | "AUTH_017" // PROVIDER_NOT_FOUND
  | "AUTH_018" // INVALID_CONTEXT
  | "AUTH_019"; // ADMIN_ERROR
