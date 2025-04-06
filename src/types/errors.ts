export type ErrorCode =
  | "AUTH_001" // Wallet not found
  | "AUTH_002" // Network mismatch
  | "AUTH_003" // Invalid signature
  | "AUTH_004" // Session expired
  | "AUTH_005" // Firebase error
  | "AUTH_006" // 2FA required
  | "AUTH_007" // 2FA invalid
  | "AUTH_008" // Wallet disconnected
  | "AUTH_009" // Provider error
  | "auth/email-not-verified" // Email not verified
  | "auth/verification-timeout" // Email verification timeout
  | "CONTRACT_001" // Contract not found
  | "CONTRACT_002" // Transaction failed
  | "CONTRACT_003" // Gas estimation failed
  | "NETWORK_001" // Network not supported
  | "NETWORK_002"; // Network connection failed;
