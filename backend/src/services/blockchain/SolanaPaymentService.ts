import { BasePaymentService } from "./BasePaymentService";
import { CryptocurrencyInfo } from "../../types/payment";

/**
 * Service de paiement pour Solana
 * Implémente les fonctionnalités spécifiques à Solana
 */
export class SolanaPaymentService extends BasePaymentService {
  /**
   * Constructeur
   * @param rpcUrl URL du RPC Solana (optionnel)
   */
  constructor(rpcUrl?: string) {
    super(
      "solana",
      0 // Solana n'a pas de chainId comme les blockchains EVM
    );
  }

  /**
   * Initialise les cryptomonnaies supportées sur Solana
   */
  protected initSupportedCryptocurrencies(): void {
    // Crypto native
    this.supportedCrypto["SOL"] = {
      symbol: "SOL",
      address: null,
      name: "Solana",
      decimals: 9,
      isNative: true,
      isStablecoin: false,
      logoUrl: "/assets/crypto/sol.png",
      minAmount: 5,
    };

    // Stablecoins
    this.supportedCrypto["USDT"] = {
      symbol: "USDT",
      address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      name: "Tether USD (Solana)",
      decimals: 6,
      isNative: false,
      isStablecoin: true,
      logoUrl: "/assets/crypto/usdt.png",
      minAmount: 5,
    };

    this.supportedCrypto["USDC"] = {
      symbol: "USDC",
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      name: "USD Coin (Solana)",
      decimals: 6,
      isNative: false,
      isStablecoin: true,
      logoUrl: "/assets/crypto/usdc.png",
      minAmount: 5,
    };
  }

  /**
   * Récupère le symbole de la crypto native
   * @returns Symbole de la crypto native
   */
  protected getNativeSymbol(): string {
    return "SOL";
  }

  /**
   * Récupère le nombre minimum de confirmations requis
   * @returns Nombre de confirmations
   */
  protected getMinConfirmations(): number {
    // Pour Solana, on demande 32 confirmations (finality)
    return 32;
  }

  /**
   * Récupère le temps estimé pour une transaction
   * @returns Temps estimé en secondes
   */
  protected getEstimatedTransactionTime(): number {
    // Pour Solana, environ 400ms par bloc
    return 13; // 32 confirmations * 0.4 secondes
  }

  /**
   * Note: Pour une implémentation complète, il faudrait utiliser @solana/web3.js
   * pour interagir avec la blockchain Solana, car elle a une API différente
   * des blockchains EVM. Cette implémentation est simplifiée pour la démo.
   */
}
