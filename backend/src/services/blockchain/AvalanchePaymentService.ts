import { BasePaymentService } from "./BasePaymentService";
import { CryptocurrencyInfo } from "../../types/payment";

/**
 * Service de paiement pour Avalanche
 * Implémente les fonctionnalités spécifiques à Avalanche
 */
export class AvalanchePaymentService extends BasePaymentService {
  /**
   * Constructeur
   * @param rpcUrl URL du RPC Avalanche (optionnel)
   */
  constructor(rpcUrl?: string) {
    super(
      "avalanche",
      43114 // Avalanche C-Chain Mainnet
    );
  }

  /**
   * Initialise les cryptomonnaies supportées sur Avalanche
   */
  protected initSupportedCryptocurrencies(): void {
    // Crypto native
    this.supportedCrypto["AVAX"] = {
      symbol: "AVAX",
      address: null,
      name: "Avalanche",
      decimals: 18,
      isNative: true,
      isStablecoin: false,
      logoUrl: "/assets/crypto/avax.png",
      minAmount: 5,
    };

    // Stablecoins
    this.supportedCrypto["USDT"] = {
      symbol: "USDT",
      address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
      name: "Tether USD (Avalanche)",
      decimals: 6,
      isNative: false,
      isStablecoin: true,
      logoUrl: "/assets/crypto/usdt.png",
      minAmount: 5,
    };

    this.supportedCrypto["USDC"] = {
      symbol: "USDC",
      address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      name: "USD Coin (Avalanche)",
      decimals: 6,
      isNative: false,
      isStablecoin: true,
      logoUrl: "/assets/crypto/usdc.png",
      minAmount: 5,
    };

    this.supportedCrypto["DAI.e"] = {
      symbol: "DAI.e",
      address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
      name: "Dai Stablecoin (Avalanche)",
      decimals: 18,
      isNative: false,
      isStablecoin: true,
      logoUrl: "/assets/crypto/dai.png",
      minAmount: 5,
    };
  }

  /**
   * Récupère le symbole de la crypto native
   * @returns Symbole de la crypto native
   */
  protected getNativeSymbol(): string {
    return "AVAX";
  }

  /**
   * Récupère le nombre minimum de confirmations requis
   * @returns Nombre de confirmations
   */
  protected getMinConfirmations(): number {
    // Pour Avalanche, on demande 3 confirmations
    return 3;
  }

  /**
   * Récupère le temps estimé pour une transaction
   * @returns Temps estimé en secondes
   */
  protected getEstimatedTransactionTime(): number {
    // Pour Avalanche, environ 2-3 secondes par bloc
    return 9; // 3 blocs * 3 secondes
  }
}
