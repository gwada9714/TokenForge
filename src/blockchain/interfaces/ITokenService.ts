import { TokenConfig, DeploymentResult, TokenInfo, ValidationResult, LiquidityConfig } from '../types';

/**
 * Interface pour les services de gestion des tokens
 * Définit les méthodes pour créer et gérer des tokens sur différentes blockchains
 */
export interface ITokenService {
  // Méthodes pour la création et gestion des tokens
  deployToken(tokenConfig: TokenConfig): Promise<DeploymentResult>;
  getTokenInfo(tokenAddress: string): Promise<TokenInfo>;
  estimateDeploymentCost(tokenConfig: TokenConfig): Promise<bigint>;
  validateTokenConfig(tokenConfig: TokenConfig): ValidationResult;
  setupAutoLiquidity(tokenAddress: string, config: LiquidityConfig): Promise<boolean>;
}
