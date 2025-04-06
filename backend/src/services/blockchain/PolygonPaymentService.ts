import { BasePaymentService } from "./BasePaymentService";
import { CryptocurrencyInfo } from "../../types/payment";

/**
 * Service de paiement pour Polygon (anciennement Matic)
 * Implémente les fonctionnalités spécifiques à Polygon
 */
export class PolygonPaymentService extends BasePaymentService {
  /**
   * Constructeur
   * @param rpcUrl URL du RPC Polygon (optionnel)
   */
  constructor(rpcUrl?: string) {
    super(
      "polygon",
      137 // Polygon Mainnet
    );
  }

  /**
   * Initialise les cryptomonnaies supportées sur Polygon
   */
  protected initSupportedCryptocurrencies(): void {
    // Crypto native
    this.supportedCrypto["MATIC"] = {
      symbol: "MATIC",
      address: null,
      name: "Polygon",
      decimals: 18,
      isNative: true,
      isStablecoin: false,
      logoUrl: "/assets/crypto/matic.png",
      minAmount: 5,
    };

    // Stablecoins
    this.supportedCrypto["USDT"] = {
      symbol: "USDT",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      name: "Tether USD (Polygon)",
      decimals: 6,
      isNative: false,
      isStablecoin: true,
      logoUrl: "/assets/crypto/usdt.png",
      minAmount: 5,
    };

    this.supportedCrypto["USDC"] = {
      symbol: "USDC",
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      name: "USD Coin (Polygon)",
      decimals: 6,
      isNative: false,
      isStablecoin: true,
      logoUrl: "/assets/crypto/usdc.png",
      minAmount: 5,
    };

    this.supportedCrypto["DAI"] = {
      symbol: "DAI",
      address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      name: "Dai Stablecoin (Polygon)",
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
    return "MATIC";
  }

  /**
   * Récupère le nombre minimum de confirmations requis
   * @returns Nombre de confirmations
   */
  protected getMinConfirmations(): number {
    // Pour Polygon, on demande 5 confirmations (blocs plus rapides)
    return 5;
  }

  /**
   * Récupère le temps estimé pour une transaction
   * @returns Temps estimé en secondes
   */
  protected getEstimatedTransactionTime(): number {
    // Pour Polygon, environ 2 secondes par bloc
    return 10; // 5 blocs * 2 secondes
  }
}
