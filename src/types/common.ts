export interface TokenForgeUser {
  uid: string;
  email: string;
  walletAddress: string;
}

export interface FirebaseAuthState {
  user: TokenForgeUser | null;
  isLoading: boolean;
  error: Error | null;
  session: {
    uid: string;
  } | null;
  signInWithWallet: () => Promise<void>;
  signOut: () => Promise<void>;
}

export interface StakingState {
  stakedAmount: bigint;
  rewards: bigint;
  apr: number;
  totalStaked: bigint;
  stakingHistory: Array<{
    timestamp: number;
    action: "stake" | "unstake" | "claim";
    amount: bigint;
  }>;
  isLoading: boolean;
  stake: (amount: number) => Promise<{ wait: () => Promise<void> }>;
  unstake: (amount: number) => Promise<{ wait: () => Promise<void> }>;
  claimRewards: () => Promise<{ wait: () => Promise<void> }>;
  refreshBalances: () => Promise<void>;
}

export const SUPPORTED_CHAINS = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia Testnet",
} as const;

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS;
