import { BasePaymentService } from "./BasePaymentService";
import { CryptocurrencyInfo } from "../../types/payment";

/**
 * Service de paiement pour Ethereum
 * Implémente les fonctionnalités spécifiques à Ethereum
 */
export class EthereumPaymentService extends BasePaymentService {
  /**
   * Constructeur
   * @param rpcUrl URL du RPC Ethereum (optionnel)
   */
  constructor(rpcUrl?: string) {
    super(
      "ethereum",
      1 // Ethereum Mainnet
    );
  }

  /**
   * Initialise les cryptomonnaies supportées sur Ethereum
   */
  protected initSupportedCryptocurrencies(): void {
    // Crypto native
    this.supportedCrypto["ETH"] = {
      symbol: "ETH",
      address: null,
      name: "Ethereum",
      decimals: 18,
      isNative: true,
      isStablecoin: false,
      logoUrl: "/assets/crypto/eth.png",
      minAmount: 5,
    };

    // Stablecoins
    this.supportedCrypto["USDT"] = {
      symbol: "USDT",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      name: "Tether USD",
      decimals: 6,
      isNative: false,
      isStablecoin: true,
      logoUrl: "/assets/crypto/usdt.png",
      minAmount: 5,
    };

    this.supportedCrypto["USDC"] = {
      symbol: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      name: "USD Coin",
      decimals: 6,
      isNative: false,
      isStablecoin: true,
      logoUrl: "/assets/crypto/usdc.png",
      minAmount: 5,
    };

    this.supportedCrypto["DAI"] = {
      symbol: "DAI",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      name: "Dai Stablecoin",
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
    return "ETH";
  }

  /**
   * Récupère le nombre minimum de confirmations requis
   * @returns Nombre de confirmations
   */
  protected getMinConfirmations(): number {
    // Pour Ethereum, on demande 3 confirmations
    return 3;
  }

  /**
   * Récupère le temps estimé pour une transaction
   * @returns Temps estimé en secondes
   */
  protected getEstimatedTransactionTime(): number {
    // Pour Ethereum, environ 15 secondes par bloc
    return 45; // 3 blocs * 15 secondes
  }
}
