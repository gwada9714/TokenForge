import { IPaymentService } from "../interfaces/IPaymentService";
import {
  PaymentStatus,
  LegacyPaymentStatus,
  CryptocurrencyInfo,
  FeeEstimate,
  CryptoAmount,
  PaymentInitParams,
  PaymentSession,
} from "../types/payment";
// import { createPaymentService } from '../factory'; // Non utilisé
import { PriceOracleService } from "./PriceOracleService";
import { v4 as uuidv4 } from "uuid";

/**
 * Service commun pour la gestion des paiements blockchain
 * Fournit une interface unifiée pour les paiements sur différentes blockchains
 */
export class PaymentService implements IPaymentService {
  private chainName: string;
  private priceOracle: PriceOracleService;
  private receivingAddress: string = "0x92e92b2705edc3d4c7204f961cc659c0"; // Adresse du wallet MetaMask centralisé

  /**
   * Constructeur du service de paiement
   * @param chainName Nom de la blockchain (ethereum, binance, polygon, avalanche, arbitrum, solana)
   * @param _walletProvider Provider du wallet (window.ethereum, etc.) - non utilisé actuellement
   */
  constructor(chainName: string, _walletProvider?: any) {
    this.chainName = chainName;
    this.priceOracle = new PriceOracleService();
  }

  /**
   * Initialise une session de paiement (nouvelle API)
   * @param params Paramètres d'initialisation du paiement
   * @returns Session de paiement
   */
  async initPaymentSession(params: PaymentInitParams): Promise<PaymentSession> {
    try {
      // Vérifier que la crypto est supportée
      const supportedCryptos = await this.getSupportedCryptocurrencies();
      const currency = supportedCryptos.find(
        (c) => c.symbol === params.currency
      );

      if (!currency) {
        throw new Error(
          `Cryptocurrency ${params.currency} not supported on ${this.chainName}`
        );
      }

      // Convertir le montant EUR en crypto
      const cryptoAmount = await this.convertEURtoCrypto(
        params.amount,
        params.currency
      );

      // Générer un ID de session unique
      const sessionId = uuidv4();

      // Obtenir l'ID de la chaîne
      const chainId = await this.getChainId();

      // Créer la session de paiement
      const session: PaymentSession = {
        sessionId,
        receivingAddress: this.receivingAddress,
        amountDue: cryptoAmount,
        currency,
        exchangeRate: cryptoAmount.valueEUR / params.amount,
        expiresAt: Math.floor(Date.now() / 1000) + 3600, // Expire dans 1 heure
        chainId,
        status: PaymentStatus.PENDING,
        minConfirmations: this.getMinConfirmations(),
      };

      return session;
    } catch (error) {
      console.error(
        `Error initializing payment session on ${this.chainName}:`,
        error
      );
      throw new Error(
        `Failed to initialize payment session: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Vérifie le statut d'un paiement (nouvelle API)
   * @param sessionId Identifiant de la session de paiement
   * @returns Statut du paiement
   */
  async checkPaymentStatus(_sessionId: string): Promise<PaymentStatus> {
    try {
      // Dans une implémentation réelle, on récupérerait le statut depuis une base de données
      // Pour la démo, on simule un statut aléatoire
      const statuses = [
        PaymentStatus.PENDING,
        PaymentStatus.CONFIRMING,
        PaymentStatus.COMPLETED,
        PaymentStatus.EXPIRED,
        PaymentStatus.FAILED,
      ];

      // Pour la démo, on retourne un statut aléatoire
      // Dans une implémentation réelle, on vérifierait le statut dans la base de données
      return statuses[Math.floor(Math.random() * statuses.length)];
    } catch (error) {
      console.error(
        `Error checking payment status on ${this.chainName}:`,
        error
      );
      return PaymentStatus.FAILED;
    }
  }

  /**
   * Confirme un paiement avec le hash de transaction (nouvelle API)
   * @param sessionId Identifiant de la session de paiement
   * @param txHash Hash de la transaction
   * @returns true si le paiement est confirmé, false sinon
   */
  async confirmPayment(_sessionId: string, _txHash: string): Promise<boolean> {
    try {
      // Dans une implémentation réelle, on vérifierait la transaction sur la blockchain
      // Pour la démo, on simule une confirmation réussie
      return true;
    } catch (error) {
      console.error(`Error confirming payment on ${this.chainName}:`, error);
      return false;
    }
  }

  /**
   * Récupère les cryptomonnaies supportées (nouvelle API)
   * @returns Liste des cryptomonnaies supportées
   */
  async getSupportedCryptocurrencies(): Promise<CryptocurrencyInfo[]> {
    try {
      // Dans une implémentation réelle, on récupérerait les cryptos supportées depuis une API
      // Pour la démo, on retourne une liste prédéfinie selon la blockchain
      const supportedCryptos: CryptocurrencyInfo[] = [];

      switch (this.chainName.toLowerCase()) {
        case "ethereum":
          // Crypto native
          supportedCryptos.push({
            symbol: "ETH",
            address: null,
            name: "Ethereum",
            decimals: 18,
            isNative: true,
            isStablecoin: false,
            logoUrl: "/assets/crypto/eth.png",
            minAmount: 5,
          });

          // Stablecoins
          supportedCryptos.push({
            symbol: "USDT",
            address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            name: "Tether USD",
            decimals: 6,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/usdt.png",
            minAmount: 5,
          });

          supportedCryptos.push({
            symbol: "USDC",
            address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            name: "USD Coin",
            decimals: 6,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/usdc.png",
            minAmount: 5,
          });

          supportedCryptos.push({
            symbol: "DAI",
            address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            name: "Dai Stablecoin",
            decimals: 18,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/dai.png",
            minAmount: 5,
          });
          break;

        case "binance":
        case "bsc":
          // Crypto native
          supportedCryptos.push({
            symbol: "BNB",
            address: null,
            name: "Binance Coin",
            decimals: 18,
            isNative: true,
            isStablecoin: false,
            logoUrl: "/assets/crypto/bnb.png",
            minAmount: 5,
          });

          // Stablecoins
          supportedCryptos.push({
            symbol: "BUSD",
            address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
            name: "Binance USD",
            decimals: 18,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/busd.png",
            minAmount: 5,
          });

          supportedCryptos.push({
            symbol: "USDT",
            address: "0x55d398326f99059fF775485246999027B3197955",
            name: "Tether USD (BSC)",
            decimals: 18,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/usdt.png",
            minAmount: 5,
          });
          break;

        case "polygon":
          // Crypto native
          supportedCryptos.push({
            symbol: "MATIC",
            address: null,
            name: "Polygon",
            decimals: 18,
            isNative: true,
            isStablecoin: false,
            logoUrl: "/assets/crypto/matic.png",
            minAmount: 5,
          });

          // Stablecoins
          supportedCryptos.push({
            symbol: "USDT",
            address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            name: "Tether USD (Polygon)",
            decimals: 6,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/usdt.png",
            minAmount: 5,
          });

          supportedCryptos.push({
            symbol: "USDC",
            address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            name: "USD Coin (Polygon)",
            decimals: 6,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/usdc.png",
            minAmount: 5,
          });
          break;

        case "avalanche":
          // Crypto native
          supportedCryptos.push({
            symbol: "AVAX",
            address: null,
            name: "Avalanche",
            decimals: 18,
            isNative: true,
            isStablecoin: false,
            logoUrl: "/assets/crypto/avax.png",
            minAmount: 5,
          });

          // Stablecoins
          supportedCryptos.push({
            symbol: "USDT",
            address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
            name: "Tether USD (Avalanche)",
            decimals: 6,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/usdt.png",
            minAmount: 5,
          });
          break;

        case "solana":
          // Crypto native
          supportedCryptos.push({
            symbol: "SOL",
            address: null,
            name: "Solana",
            decimals: 9,
            isNative: true,
            isStablecoin: false,
            logoUrl: "/assets/crypto/sol.png",
            minAmount: 5,
          });

          // Stablecoins
          supportedCryptos.push({
            symbol: "USDT",
            address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
            name: "Tether USD (Solana)",
            decimals: 6,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/usdt.png",
            minAmount: 5,
          });

          supportedCryptos.push({
            symbol: "USDC",
            address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            name: "USD Coin (Solana)",
            decimals: 6,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/usdc.png",
            minAmount: 5,
          });
          break;

        case "arbitrum":
          // Crypto native
          supportedCryptos.push({
            symbol: "ETH",
            address: null,
            name: "Ethereum (Arbitrum)",
            decimals: 18,
            isNative: true,
            isStablecoin: false,
            logoUrl: "/assets/crypto/eth.png",
            minAmount: 5,
          });

          // Stablecoins
          supportedCryptos.push({
            symbol: "USDT",
            address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
            name: "Tether USD (Arbitrum)",
            decimals: 6,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/usdt.png",
            minAmount: 5,
          });

          supportedCryptos.push({
            symbol: "USDC",
            address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
            name: "USD Coin (Arbitrum)",
            decimals: 6,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/usdc.png",
            minAmount: 5,
          });
          break;

        default:
          // Par défaut, on retourne ETH et USDT
          supportedCryptos.push({
            symbol: "ETH",
            address: null,
            name: "Ethereum",
            decimals: 18,
            isNative: true,
            isStablecoin: false,
            logoUrl: "/assets/crypto/eth.png",
            minAmount: 5,
          });

          supportedCryptos.push({
            symbol: "USDT",
            address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            name: "Tether USD",
            decimals: 6,
            isNative: false,
            isStablecoin: true,
            logoUrl: "/assets/crypto/usdt.png",
            minAmount: 5,
          });
      }

      return supportedCryptos;
    } catch (error) {
      console.error(
        `Error getting supported cryptocurrencies for ${this.chainName}:`,
        error
      );
      return [];
    }
  }

  /**
   * Estime les frais de transaction (nouvelle API)
   * @param amount Montant en EUR
   * @param currencyAddress Adresse du token (null pour crypto native)
   * @returns Estimation des frais
   */
  async estimateTransactionFees(
    _amount: number,
    currencyAddress: string | null
  ): Promise<FeeEstimate> {
    try {
      // Dans une implémentation réelle, on estimerait les frais selon la blockchain
      // Pour la démo, on retourne des valeurs prédéfinies

      // Déterminer la crypto native selon la blockchain
      let nativeSymbol = "ETH";
      let nativeDecimals = 18;

      switch (this.chainName.toLowerCase()) {
        case "binance":
        case "bsc":
          nativeSymbol = "BNB";
          break;
        case "polygon":
          nativeSymbol = "MATIC";
          break;
        case "avalanche":
          nativeSymbol = "AVAX";
          break;
        case "solana":
          nativeSymbol = "SOL";
          nativeDecimals = 9;
          break;
        case "arbitrum":
          nativeSymbol = "ETH";
          break;
      }

      // Estimer les frais en crypto native
      let baseFeeAmount: number;

      if (this.chainName.toLowerCase() === "solana") {
        // Solana a des frais très bas
        baseFeeAmount = 0.000005;
      } else if (this.chainName.toLowerCase() === "polygon") {
        // Polygon a des frais bas
        baseFeeAmount = 0.001;
      } else if (
        this.chainName.toLowerCase() === "binance" ||
        this.chainName.toLowerCase() === "bsc"
      ) {
        // BSC a des frais moyens
        baseFeeAmount = 0.0005;
      } else if (this.chainName.toLowerCase() === "avalanche") {
        // Avalanche a des frais moyens
        baseFeeAmount = 0.001;
      } else if (this.chainName.toLowerCase() === "arbitrum") {
        // Arbitrum a des frais moyens-élevés
        baseFeeAmount = 0.0008;
      } else {
        // Ethereum a des frais élevés
        baseFeeAmount = 0.003;
      }

      // Si c'est un token (non natif), les frais sont plus élevés
      if (currencyAddress !== null) {
        baseFeeAmount *= 3; // Les transactions de tokens sont plus coûteuses
      }

      // Calculer les frais max (20% de plus)
      const maxFeeAmount = baseFeeAmount * 1.2;

      // Convertir en valeur EUR
      const nativePriceEUR = await this.priceOracle.getCryptoPrice(
        nativeSymbol,
        "EUR"
      );
      const baseFeeEUR = baseFeeAmount * nativePriceEUR;
      const maxFeeEUR = maxFeeAmount * nativePriceEUR;

      // Formater les montants
      const baseFeeCrypto = this.formatCryptoAmount(
        baseFeeAmount,
        nativeSymbol,
        nativeDecimals
      );
      const maxFeeCrypto = this.formatCryptoAmount(
        maxFeeAmount,
        nativeSymbol,
        nativeDecimals
      );

      return {
        baseFee: {
          amount: baseFeeCrypto.amount,
          formatted: baseFeeCrypto.formatted,
          valueEUR: baseFeeEUR,
        },
        maxFee: {
          amount: maxFeeCrypto.amount,
          formatted: maxFeeCrypto.formatted,
          valueEUR: maxFeeEUR,
        },
        estimatedTimeSeconds: this.getEstimatedTransactionTime(),
      };
    } catch (error) {
      console.error(
        `Error estimating transaction fees on ${this.chainName}:`,
        error
      );

      // Valeurs par défaut en cas d'erreur
      return {
        baseFee: {
          amount: "0",
          formatted: "0.001 ETH",
          valueEUR: 2.5,
        },
        maxFee: {
          amount: "0",
          formatted: "0.0012 ETH",
          valueEUR: 3,
        },
        estimatedTimeSeconds: 60,
      };
    }
  }

  /**
   * Convertit un montant EUR en crypto (nouvelle API)
   * @param amountEUR Montant en EUR
   * @param currencySymbol Symbole de la crypto
   * @returns Montant en crypto
   */
  async convertEURtoCrypto(
    amountEUR: number,
    currencySymbol: string
  ): Promise<CryptoAmount> {
    try {
      // Récupérer les infos de la crypto
      const supportedCryptos = await this.getSupportedCryptocurrencies();
      const currency = supportedCryptos.find(
        (c) => c.symbol === currencySymbol
      );

      if (!currency) {
        throw new Error(
          `Currency ${currencySymbol} not supported on ${this.chainName}`
        );
      }

      // Convertir EUR en crypto
      let cryptoAmount: number;

      if (currency.isStablecoin) {
        // Pour les stablecoins, on considère 1 USD ≈ 1 stablecoin
        // avec un taux de conversion EUR/USD
        const eurUsdRate = await this.priceOracle.getEURUSDRate();
        cryptoAmount = amountEUR * eurUsdRate;

        // Ajouter une marge de sécurité de 2%
        cryptoAmount = cryptoAmount * 1.02;
      } else {
        // Pour les cryptos natives, obtenir le prix actuel
        const cryptoPriceEUR = await this.priceOracle.getCryptoPrice(
          currencySymbol,
          "EUR"
        );

        // Calculer le montant en crypto
        cryptoAmount = amountEUR / cryptoPriceEUR;

        // Ajouter une marge de sécurité de 5% pour la volatilité
        cryptoAmount = cryptoAmount * 1.05;
      }

      // Formater le montant
      return this.formatCryptoAmount(
        cryptoAmount,
        currencySymbol,
        currency.decimals,
        amountEUR
      );
    } catch (error) {
      console.error(
        `Error converting EUR to crypto on ${this.chainName}:`,
        error
      );
      throw new Error(
        `Failed to convert EUR to ${currencySymbol}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Crée une session de paiement (ancienne API)
   * @param amount Montant à payer
   * @param currency Devise (ETH, BNB, MATIC, AVAX, SOL, etc.)
   * @returns Identifiant de la session de paiement
   */
  async createPaymentSession(
    amount: bigint,
    currency: string
  ): Promise<string> {
    try {
      // Convertir le montant bigint en number pour la nouvelle API
      const amountNumber =
        Number(amount) / Math.pow(10, this.getDecimals(currency));

      // Créer une session avec la nouvelle API
      const session = await this.initPaymentSession({
        userId: "legacy-user",
        productId: "legacy-product",
        productType: "token_creation",
        amount: amountNumber,
        currency,
        payerAddress: "0x0000000000000000000000000000000000000000", // Adresse fictive pour la compatibilité
      });

      // Retourner l'ID de session
      return session.sessionId;
    } catch (error) {
      console.error(
        `Error creating payment session on ${this.chainName}:`,
        error
      );
      throw new Error(
        `Failed to create payment session: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Récupère le statut d'une session de paiement (ancienne API)
   * @param sessionId Identifiant de la session de paiement
   * @returns Statut du paiement
   */
  async getPaymentStatus(sessionId: string): Promise<LegacyPaymentStatus> {
    try {
      // Récupérer le statut avec la nouvelle API
      const status = await this.checkPaymentStatus(sessionId);

      // Convertir le statut pour l'ancienne API
      let legacyStatus: "pending" | "completed" | "failed";

      switch (status) {
        case PaymentStatus.COMPLETED:
          legacyStatus = "completed";
          break;
        case PaymentStatus.FAILED:
        case PaymentStatus.EXPIRED:
          legacyStatus = "failed";
          break;
        default:
          legacyStatus = "pending";
      }

      return {
        status: legacyStatus,
        details: {
          sessionId,
          newStatus: status,
        },
      };
    } catch (error) {
      console.error(
        `Error getting payment status on ${this.chainName}:`,
        error
      );
      return {
        status: "failed",
        details: {
          error: error instanceof Error ? error.message : String(error),
          sessionId,
        },
      };
    }
  }

  /**
   * Vérifie si un paiement a été effectué (ancienne API)
   * @param transactionHash Hash de la transaction
   * @returns true si le paiement est valide, false sinon
   */
  async verifyPayment(_transactionHash: string): Promise<boolean> {
    try {
      // Utiliser la nouvelle API pour vérifier le paiement
      // Note: Dans la nouvelle API, on utiliserait confirmPayment avec un sessionId
      // Pour la compatibilité, on simule une vérification réussie
      return true;
    } catch (error) {
      console.error(`Error verifying payment on ${this.chainName}:`, error);
      return false;
    }
  }

  /**
   * Calcule les frais pour un montant donné (ancienne API)
   * @param amount Montant pour lequel calculer les frais
   * @returns Frais estimés
   */
  async calculateFees(amount: bigint): Promise<bigint> {
    try {
      // Convertir le montant bigint en number pour la nouvelle API
      const currency = this.getNativeCurrency();
      const decimals = this.getDecimals(currency);
      const amountNumber = Number(amount) / Math.pow(10, decimals);

      // Estimer les frais avec la nouvelle API
      const fees = await this.estimateTransactionFees(amountNumber, null);

      // Convertir les frais en bigint pour l'ancienne API
      const baseFeeAmount = fees.baseFee.amount;
      return BigInt(baseFeeAmount);
    } catch (error) {
      console.error(`Error calculating fees on ${this.chainName}:`, error);
      // Retourner une estimation par défaut en cas d'erreur
      return (amount * 5n) / 100n; // 5% par défaut
    }
  }

  /**
   * Calcule le montant total (montant + frais)
   * @param amount Montant de base
   * @returns Montant total incluant les frais
   */
  async calculateTotalAmount(amount: bigint): Promise<bigint> {
    const fees = await this.calculateFees(amount);
    return amount + fees;
  }

  /**
   * Formate un montant avec le symbole de la devise
   * @param amount Montant à formater
   * @param currency Devise (ETH, BNB, MATIC, AVAX, SOL, etc.)
   * @returns Montant formaté avec symbole
   */
  formatAmount(amount: bigint, currency: string): string {
    // Déterminer le nombre de décimales en fonction de la devise
    const decimals = this.getDecimals(currency);

    // Convertir le montant en nombre à virgule flottante
    const value = Number(amount) / Math.pow(10, decimals);

    // Formater avec 6 décimales maximum
    return `${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })} ${currency.toUpperCase()}`;
  }

  /**
   * Génère un reçu de paiement
   * @param sessionId Identifiant de la session de paiement
   * @param transactionHash Hash de la transaction
   * @param amount Montant payé
   * @param currency Devise
   * @returns Objet contenant les détails du reçu
   */
  async generateReceipt(
    sessionId: string,
    transactionHash: string,
    amount: bigint,
    currency: string
  ): Promise<{
    sessionId: string;
    transactionHash: string;
    amount: string;
    timestamp: string;
    status: string;
  }> {
    // Vérifier que le paiement est valide
    const isValid = await this.verifyPayment(transactionHash);

    return {
      sessionId,
      transactionHash,
      amount: this.formatAmount(amount, currency),
      timestamp: new Date().toISOString(),
      status: isValid ? "confirmed" : "pending",
    };
  }

  // Méthodes utilitaires privées

  /**
   * Formate un montant en crypto
   * @param amount Montant en crypto (unités décimales)
   * @param symbol Symbole de la crypto
   * @param decimals Nombre de décimales
   * @param valueEUR Valeur équivalente en EUR (optionnel)
   * @returns Montant formaté
   */
  private formatCryptoAmount(
    amount: number,
    symbol: string,
    decimals: number,
    valueEUR?: number
  ): CryptoAmount {
    // Convertir en unités entières (wei, satoshi, etc.)
    const rawAmount = (amount * Math.pow(10, decimals)).toString();

    // Formater pour l'affichage
    const formatted = `${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })} ${symbol}`;

    return {
      amount: rawAmount,
      formatted,
      valueEUR: valueEUR || 0,
    };
  }

  /**
   * Récupère le nombre de décimales pour une devise
   * @param currency Symbole de la devise
   * @returns Nombre de décimales
   */
  private getDecimals(currency: string): number {
    const upperCurrency = currency.toUpperCase();

    if (upperCurrency === "SOL") return 9;
    if (["USDT", "USDC"].includes(upperCurrency)) return 6;

    return 18; // Par défaut pour la plupart des tokens EVM
  }

  /**
   * Récupère le symbole de la crypto native pour la blockchain actuelle
   * @returns Symbole de la crypto native
   */
  private getNativeCurrency(): string {
    switch (this.chainName.toLowerCase()) {
      case "binance":
      case "bsc":
        return "BNB";
      case "polygon":
        return "MATIC";
      case "avalanche":
        return "AVAX";
      case "solana":
        return "SOL";
      case "arbitrum":
      case "ethereum":
      default:
        return "ETH";
    }
  }

  /**
   * Récupère l'ID de la chaîne actuelle
   * @returns ID de la chaîne
   */
  private async getChainId(): Promise<number> {
    switch (this.chainName.toLowerCase()) {
      case "ethereum":
        return 1; // Ethereum Mainnet
      case "binance":
      case "bsc":
        return 56; // Binance Smart Chain
      case "polygon":
        return 137; // Polygon Mainnet
      case "avalanche":
        return 43114; // Avalanche C-Chain
      case "solana":
        return 0; // Solana n'utilise pas d'ID de chaîne numérique standard
      case "arbitrum":
        return 42161; // Arbitrum One
      default:
        return 1; // Ethereum Mainnet par défaut
    }
  }

  /**
   * Récupère le nombre minimum de confirmations requis pour cette blockchain
   * @returns Nombre de confirmations
   */
  private getMinConfirmations(): number {
    switch (this.chainName.toLowerCase()) {
      case "ethereum":
        return 12; // Ethereum nécessite plus de confirmations
      case "binance":
      case "bsc":
        return 5; // BSC est plus rapide
      case "polygon":
        return 5; // Polygon est rapide
      case "avalanche":
        return 5; // Avalanche est rapide
      case "solana":
        return 32; // Solana a des confirmations rapides mais nombreuses
      case "arbitrum":
        return 5; // Arbitrum est rapide
      default:
        return 10; // Valeur par défaut
    }
  }

  /**
   * Récupère le temps estimé pour une transaction sur cette blockchain
   * @returns Temps estimé en secondes
   */
  private getEstimatedTransactionTime(): number {
    switch (this.chainName.toLowerCase()) {
      case "ethereum":
        return 180; // ~3 minutes sur Ethereum
      case "binance":
      case "bsc":
        return 45; // ~45 secondes sur BSC
      case "polygon":
        return 30; // ~30 secondes sur Polygon
      case "avalanche":
        return 30; // ~30 secondes sur Avalanche
      case "solana":
        return 15; // ~15 secondes sur Solana
      case "arbitrum":
        return 60; // ~1 minute sur Arbitrum
      default:
        return 120; // 2 minutes par défaut
    }
  }
}
