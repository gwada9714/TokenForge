import { ITokenService } from "../interfaces/ITokenService";
import { createTokenService } from "../factory";
import {
  TokenConfig,
  DeploymentResult,
  TokenInfo,
  ValidationResult,
  LiquidityConfig,
} from "../types";

/**
 * Service commun pour la gestion des tokens blockchain
 * Fournit une interface unifiée pour les opérations de tokens sur différentes blockchains
 */
export class TokenService implements ITokenService {
  private chainName: string;
  // Utilisation du préfixe _ pour indiquer que cette variable est stockée mais pas utilisée directement
  // Cette variable pourrait être utilisée dans une implémentation future
  private readonly _walletProvider: any;
  private tokenService: any; // Changé de ITokenService à any pour éviter les erreurs circulaires

  /**
   * Constructeur du service de token
   * @param chainName Nom de la blockchain (ethereum, binance, polygon, avalanche, arbitrum, solana)
   * @param walletProvider Provider du wallet (window.ethereum, etc.)
   */
  constructor(chainName: string, walletProvider?: any) {
    this.chainName = chainName;
    this._walletProvider = walletProvider;
    this.tokenService = createTokenService(chainName, walletProvider);
  }

  /**
   * Déploie un token sur la blockchain
   * @param tokenConfig Configuration du token à déployer
   * @returns Résultat du déploiement
   */
  async deployToken(tokenConfig: TokenConfig): Promise<DeploymentResult> {
    try {
      // Valider la configuration du token
      const validation = this.validateTokenConfig(tokenConfig);
      if (!validation.valid) {
        throw new Error(
          `Invalid token configuration: ${validation.errors.join(", ")}`
        );
      }

      // Déployer le token via le service spécifique à la blockchain
      return await this.tokenService.deployToken(tokenConfig);
    } catch (error) {
      console.error(`Error deploying token on ${this.chainName}:`, error);
      throw new Error(
        `Failed to deploy token: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Récupère les informations d'un token déployé
   * @param tokenAddress Adresse du token
   * @returns Informations du token
   */
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      return await this.tokenService.getTokenInfo(tokenAddress);
    } catch (error) {
      console.error(`Error getting token info on ${this.chainName}:`, error);
      throw new Error(
        `Failed to get token info: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Estime le coût de déploiement d'un token
   * @param tokenConfig Configuration du token
   * @returns Coût estimé en crypto native (wei, gwei, etc.)
   */
  async estimateDeploymentCost(tokenConfig: TokenConfig): Promise<bigint> {
    try {
      return await this.tokenService.estimateDeploymentCost(tokenConfig);
    } catch (error) {
      console.error(
        `Error estimating deployment cost on ${this.chainName}:`,
        error
      );
      // Retourner une estimation par défaut en cas d'erreur
      return this.getDefaultDeploymentCost();
    }
  }

  /**
   * Valide la configuration d'un token
   * @param tokenConfig Configuration du token à valider
   * @returns Résultat de la validation
   */
  validateTokenConfig(tokenConfig: TokenConfig): ValidationResult {
    try {
      // Validation de base commune à toutes les blockchains
      const errors: string[] = [];

      // Vérifier le nom
      if (!tokenConfig.name || tokenConfig.name.length < 1) {
        errors.push("Token name is required");
      } else if (tokenConfig.name.length > 50) {
        errors.push("Token name must be less than 50 characters");
      }

      // Vérifier le symbole
      if (!tokenConfig.symbol || tokenConfig.symbol.length < 1) {
        errors.push("Token symbol is required");
      } else if (tokenConfig.symbol.length > 10) {
        errors.push("Token symbol must be less than 10 characters");
      }

      // Vérifier les décimales
      if (tokenConfig.decimals < 0 || tokenConfig.decimals > 18) {
        errors.push("Token decimals must be between 0 and 18");
      }

      // Vérifier le supply initial
      if (tokenConfig.initialSupply <= 0) {
        errors.push("Initial supply must be greater than 0");
      }

      // Vérifier le supply maximum (si spécifié)
      if (
        tokenConfig.maxSupply !== undefined &&
        tokenConfig.maxSupply < tokenConfig.initialSupply
      ) {
        errors.push(
          "Max supply must be greater than or equal to initial supply"
        );
      }

      // Vérifier les configurations spécifiques à la blockchain
      const blockchainValidation =
        this.tokenService.validateTokenConfig(tokenConfig);
      errors.push(...blockchainValidation.errors);

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      console.error(
        `Error validating token config on ${this.chainName}:`,
        error
      );
      return {
        valid: false,
        errors: [
          `Validation error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
      };
    }
  }

  /**
   * Configure la liquidité automatique pour un token
   * @param tokenAddress Adresse du token
   * @param config Configuration de la liquidité
   * @returns true si la configuration a réussi, false sinon
   */
  async setupAutoLiquidity(
    tokenAddress: string,
    config: LiquidityConfig
  ): Promise<boolean> {
    try {
      return await this.tokenService.setupAutoLiquidity(tokenAddress, config);
    } catch (error) {
      console.error(
        `Error setting up auto liquidity on ${this.chainName}:`,
        error
      );
      return false;
    }
  }

  /**
   * Vérifie si un token est vérifié sur la blockchain
   * @param tokenAddress Adresse du token
   * @returns true si le token est vérifié, false sinon
   */
  async isTokenVerified(tokenAddress: string): Promise<boolean> {
    try {
      // Cette méthode peut ne pas être disponible sur toutes les blockchains
      if (typeof this.tokenService.isTokenVerified === "function") {
        return await this.tokenService.isTokenVerified(tokenAddress);
      }
      return false;
    } catch (error) {
      console.error(
        `Error checking token verification on ${this.chainName}:`,
        error
      );
      return false;
    }
  }

  /**
   * Vérifie un token sur la blockchain (Etherscan, BscScan, etc.)
   * @param tokenAddress Adresse du token
   * @param contractSource Code source du contrat
   * @returns true si la vérification a réussi, false sinon
   */
  async verifyToken(
    tokenAddress: string,
    contractSource: string
  ): Promise<boolean> {
    try {
      // Cette méthode peut ne pas être disponible sur toutes les blockchains
      if (typeof this.tokenService.verifyToken === "function") {
        return await this.tokenService.verifyToken(
          tokenAddress,
          contractSource
        );
      }
      return false;
    } catch (error) {
      console.error(`Error verifying token on ${this.chainName}:`, error);
      return false;
    }
  }

  /**
   * Récupère le coût de déploiement par défaut pour la blockchain actuelle
   * @returns Coût de déploiement par défaut
   */
  private getDefaultDeploymentCost(): bigint {
    switch (this.chainName.toLowerCase()) {
      case "ethereum":
        return BigInt("50000000000000000"); // 0.05 ETH
      case "binance":
      case "bsc":
        return BigInt("100000000000000000"); // 0.1 BNB
      case "polygon":
        return BigInt("50000000000000000000"); // 50 MATIC
      case "avalanche":
        return BigInt("500000000000000000"); // 0.5 AVAX
      case "arbitrum":
        return BigInt("10000000000000000"); // 0.01 ETH
      case "solana":
        return BigInt("10000000"); // 0.01 SOL (en lamports)
      default:
        return BigInt("100000000000000000"); // 0.1 par défaut
    }
  }
}
