import { BaseWalletState } from "./baseWalletState";

export interface TabSyncMessage {
  type: string;
  payload?: {
    state?: BaseWalletState;
    chainId?: number;
  };
  timestamp: number;
  tabId: string;
  priority?: number;
}
