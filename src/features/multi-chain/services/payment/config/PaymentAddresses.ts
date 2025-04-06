import { Address } from "viem";
import { PublicKey } from "@solana/web3.js";
import { PaymentNetwork } from "../types/PaymentSession";

export const DEFAULT_RECEIVER_ADDRESS =
  "0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A" as Address;

export const PAYMENT_ADDRESSES = {
  // Adresses pour les différents réseaux
  [PaymentNetwork.ETHEREUM]: DEFAULT_RECEIVER_ADDRESS,
  [PaymentNetwork.BINANCE]: DEFAULT_RECEIVER_ADDRESS,
  [PaymentNetwork.POLYGON]: DEFAULT_RECEIVER_ADDRESS,
  // Pour Solana, nous devrons convertir l'adresse
  [PaymentNetwork.SOLANA]: new PublicKey(DEFAULT_RECEIVER_ADDRESS),
} as const;

// Fonction utilitaire pour obtenir l'adresse de réception pour un réseau donné
export function getReceiverAddress(
  network: PaymentNetwork
): Address | PublicKey {
  return PAYMENT_ADDRESSES[network];
}
