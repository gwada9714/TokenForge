export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  features: {
    mintable: boolean;
    burnable: boolean;
    pausable: boolean;
  };
}

export interface TokenFeatures {
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  // Add other feature flags
}

export interface TokenEvent {
  id: string;
  event: string;
  from: string;
  to: string;
  amount?: string;
  timestamp: number;
  transactionHash: string;
}

export interface TokenOperation {
  type: 'mint' | 'burn' | 'pause' | 'unpause' | 'transfer';
  status: 'pending' | 'success' | 'error';
  error?: string;
  txHash?: string;
}

export interface TokenDeploymentStatus {
  status: 'pending' | 'deploying' | 'success' | 'error';
  txHash?: string;
  error?: string;
}

export interface TokenData extends TokenConfig {
  address: string;
  deploymentStatus: TokenDeploymentStatus;
  createdAt: number;
  updatedAt: number;
}
