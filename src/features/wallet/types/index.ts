export interface WalletState {
  address: string | null;
  chainId: number | null;
  connected: boolean;
  loading: boolean;
  error: Error | null;
}

export interface WalletConfig {
  defaultChainId: number;
  supportedChainIds: number[];
}
