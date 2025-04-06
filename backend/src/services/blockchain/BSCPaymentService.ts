import { BasePaymentService } from "./BasePaymentService";
import { CryptocurrencyInfo } from "../../types/payment";

/**
 * Service de paiement pour Binance Smart Chain (BSC)
 * Implémente les fonctionnalités spécifiques à BSC
 */
export class BSCPaymentService extends BasePaymentService {
  /**
   * Constructeur
   * @param rpcUrl URL du RPC BSC (optionnel)
   */
  constructor(rpcUrl?: string) {
    super(
      "binance",
      56 // BSC Mainnet
    );
  }

  /**
   * Initialise les cryptomonnaies supportées sur BSC
   */
  protected initSupportedCryptocurrencies(): void {
    // Crypto native
    this.supportedCrypto["BNB"] = {
      symbol: "BNB",
      address: null,
      name: "Binance Coin",
      decimals: 18,
      isNative: true,
      isStablecoin: false,
      logoUrl: "/assets/crypto/bnb.png",
      minAmount: 5,
    };

    // Stablecoins
    this.supportedCrypto["BUSD"] = {
      symbol: "BUSD",
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      name: "Binance USD",
      decimals: 18,
      isNative: false,
      isStablecoin: true,
      logoUrl: "/assets/crypto/busd.png",
      minAmount: 5,
    };

    this.supportedCrypto["USDT"] = {
      symbol: "USDT",
      address: "0x55d398326f99059fF775485246999027B3197955",
      name: "Tether USD (BSC)",
      decimals: 18,
      isNative: false,
      isStablecoin: true,
      logoUrl: "/assets/crypto/usdt.png",
      minAmount: 5,
    };

    this.supportedCrypto["USDC"] = {
      symbol: "USDC",
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      name: "USD Coin (BSC)",
      decimals: 18,
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
    return "BNB";
  }

  /**
   * Récupère le nombre minimum de confirmations requis
   * @returns Nombre de confirmations
   */
  protected getMinConfirmations(): number {
    // Pour BSC, on demande 3 confirmations
    return 3;
  }

  /**
   * Récupère le temps estimé pour une transaction
   * @returns Temps estimé en secondes
   */
  protected getEstimatedTransactionTime(): number {
    // Pour BSC, environ 3 secondes par bloc
    return 9; // 3 blocs * 3 secondes
  }
}
