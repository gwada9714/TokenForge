import { NetworkConfig } from "@/features/auth/types/wallet";

export enum PlanType {
  APPRENTI = "apprenti",
  FORGERON = "forgeron",
  MAITRE_FORGERON = "maitre_forgeron",
}

export type PaymentCurrency = "BNB" | "ETH" | "MATIC" | "USDT" | "USDC";

export interface PlanPrice {
  amount: number;
  currency: PaymentCurrency;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
}

export interface PlanLimitations {
  networks: string[];
  maxTokens?: number;
  maxTransactions?: number;
  maxCustomFunctions?: number;
  testnetOnly?: boolean;
}

export interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: PlanPrice;
  features: PlanFeature[];
  limitations: PlanLimitations;
  recommended?: boolean;
}

export interface PaymentDetails {
  planId: PlanType;
  amount: number;
  currency: PaymentCurrency;
  network: NetworkConfig;
  timestamp: number;
  status: "pending" | "completed" | "failed";
  transactionHash?: string;
}
