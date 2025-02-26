import {
  type Address,
  type Chain,
  type TestClient,
  type PublicActions,
  type WalletActions,
  type Hash
} from "viem";
import { type SupportedChain } from "./chains";

export type ExtendedTestClient = TestClient & PublicActions & WalletActions;

export interface ChainTestEnvironment {
  chain: SupportedChain;
  owner: Address;
  treasury: Address;
  development: Address;
  buyback: Address;
  staking: Address;
  user: Address;
  factory: Address;
  client: ExtendedTestClient;
}

export interface TokenTestResult {
  address: Address;
  deploymentTx: Hash;
  verificationResult: {
    success: boolean;
    error?: string;
  };
  features: {
    canMint: boolean;
    canBurn: boolean;
    canPause: boolean;
    hasTax: boolean;
    hasLiquidity: boolean;
    hasStaking: boolean;
  };
} 