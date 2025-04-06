import { PublicKey } from "@solana/web3.js";
import { Address } from "viem";

export enum PaymentNetwork {
  ETHEREUM = "ETHEREUM",
  BINANCE = "BINANCE",
  POLYGON = "POLYGON",
  SOLANA = "SOLANA",
}

export type PaymentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface PaymentToken {
  symbol: string;
  address: string;
  decimals?: number;
}

export interface PaymentSession {
  id: string;
  userId: string;
  status: PaymentStatus;
  network: PaymentNetwork;
  token: PaymentToken;
  amount: bigint;
  serviceType: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  txHash?: string;
  error?: string;
  retryCount: number;
}
