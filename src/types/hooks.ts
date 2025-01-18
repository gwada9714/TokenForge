import { type Address } from 'viem';

// Types pour les vérifications
export interface NetworkCheckResult {
  readonly isConnected: boolean;
  readonly isCorrectNetwork: boolean;
  readonly requiredNetwork: string;
  readonly networkName?: string;
  readonly error?: string;
}

export interface ContractCheckResult {
  readonly isValid: boolean;
  readonly isDeployed: boolean;
  readonly error?: string;
}

export interface WalletCheckResult {
  readonly isConnected: boolean;
  readonly currentAddress?: string;
  readonly message?: string;
}

export interface NetworkStatus {
  isConnected: boolean;
  isCorrectNetwork: boolean;
  requiredNetwork: string;
  networkName?: string;
  error?: string;
}

// Type pour le hook useTokenForgeAdmin
export interface TokenForgeAdminHookReturn {
  error: string | null;
  isPaused: boolean;
  isOwner: boolean;
  owner: Address | undefined;
  networkStatus: NetworkStatus;
  isLoading: boolean;
  pauseContract: () => Promise<void>;
  unpauseContract: () => Promise<void>;
  transferOwnership: (newOwner: Address) => Promise<void>;
  isPausing: boolean;
  isUnpausing: boolean;
  isTransferring: boolean;
}
