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
}

// Type pour le hook useTokenForgeAdmin
export interface TokenForgeAdminHookReturn {
  error: string | null;
  success: string | null;
  isAdmin: boolean;
  contractAddress: `0x${string}`;
  owner: Address | undefined;
  isProcessing: boolean;
  networkCheck: NetworkCheckResult;
  contractCheck: ContractCheckResult;
  walletCheck: WalletCheckResult;
  handleTogglePause: () => Promise<void>;
  transferOwnership: () => Promise<void>;
  handleTransferOwnership: () => Promise<void>;
  isPaused: boolean;
  isPausing: boolean;
  isUnpausing: boolean;
  isTransferring: boolean;
  pauseAvailable: boolean;
  isLoading: boolean;
  handleRetryCheck: () => Promise<void>;
  contract: any | null;
}
