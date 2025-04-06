export interface BaseWalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}
