import { TokenConfig } from '../types';
import { ChainId } from '../constants/chains';

/**
 * Utilitaires pour l'estimation des coûts de gas sur différentes blockchains
 */

// Coûts de base pour le déploiement de contrats (en unités de gas)
const BASE_DEPLOYMENT_GAS: Record<number | string, bigint> = {
  [ChainId.ETHEREUM]: 2000000n,
  [ChainId.BINANCE]: 1500000n,
  [ChainId.POLYGON]: 1800000n,
  [ChainId.AVALANCHE]: 1700000n,
  [ChainId.ARBITRUM]: 2500000n,
};

// Coûts additionnels pour les fonctionnalités (en unités de gas)
const FEATURE_GAS_COSTS = {
  MINTABLE: 150000n,
  BURNABLE: 120000n,
  TAXABLE: 300000n,
  ANTI_WHALE: 250000n,
};

/**
 * Estime le gas nécessaire pour déployer un token en fonction de sa configuration
 * @param config Configuration du token
 * @param chainId ID de la blockchain
 * @returns Estimation du gas en unités de gas
 */
export const estimateTokenDeploymentGas = (config: TokenConfig, chainId: ChainId): bigint => {
  // Gas de base pour le déploiement
  let gasEstimate = BASE_DEPLOYMENT_GAS[chainId] || 2000000n;

  // Ajout du gas pour les fonctionnalités
  if (config.mintable) {
    gasEstimate += FEATURE_GAS_COSTS.MINTABLE;
  }
  if (config.burnable) {
    gasEstimate += FEATURE_GAS_COSTS.BURNABLE;
  }
  if (config.taxable?.enabled) {
    gasEstimate += FEATURE_GAS_COSTS.TAXABLE;
  }
  if (config.antiWhale?.enabled) {
    gasEstimate += FEATURE_GAS_COSTS.ANTI_WHALE;
  }

  return gasEstimate;
};

/**
 * Estime le coût en crypto-monnaie native pour déployer un token
 * @param gasEstimate Estimation du gas en unités
 * @param gasPrice Prix du gas en wei/gwei
 * @returns Coût estimé en wei/gwei
 */
export const estimateDeploymentCost = (gasEstimate: bigint, gasPrice: bigint): bigint => {
  return gasEstimate * gasPrice;
};

/**
 * Estime le gas nécessaire pour ajouter de la liquidité
 * @param chainId ID de la blockchain
 * @returns Estimation du gas en unités de gas
 */
export const estimateAddLiquidityGas = (chainId: ChainId): bigint => {
  switch (chainId) {
    case ChainId.ETHEREUM:
      return 250000n; // Uniswap
    case ChainId.BINANCE:
      return 200000n; // PancakeSwap
    case ChainId.POLYGON:
      return 230000n; // QuickSwap
    case ChainId.AVALANCHE:
      return 220000n; // TraderJoe
    case ChainId.ARBITRUM:
      return 300000n; // SushiSwap sur Arbitrum
    default:
      return 250000n;
  }
};

/**
 * Estime le gas nécessaire pour une transaction de transfert de token
 * @param chainId ID de la blockchain
 * @returns Estimation du gas en unités de gas
 */
export const estimateTokenTransferGas = (chainId: ChainId): bigint => {
  switch (chainId) {
    case ChainId.ETHEREUM:
      return 65000n;
    case ChainId.BINANCE:
      return 55000n;
    case ChainId.POLYGON:
      return 60000n;
    case ChainId.AVALANCHE:
      return 58000n;
    case ChainId.ARBITRUM:
      return 75000n;
    default:
      return 65000n;
  }
};

/**
 * Convertit un coût en wei/gwei en une valeur lisible avec unité
 * @param cost Coût en wei/gwei
 * @param chainId ID de la blockchain
 * @returns Coût formaté avec unité
 */
export const formatGasCost = (cost: bigint, chainId: ChainId): string => {
  const decimals = 18; // La plupart des chaînes EVM utilisent 18 décimales
  
  if (cost < 10n ** 9n) {
    // Moins de 1 Gwei, afficher en Wei
    return `${cost.toString()} Wei`;
  } else if (cost < 10n ** 15n) {
    // Moins de 0.001 ETH, afficher en Gwei
    const gwei = Number(cost) / Number(10n ** 9n);
    return `${gwei.toFixed(6)} Gwei`;
  } else {
    // Afficher en ETH/BNB/MATIC/etc.
    const symbol = getChainSymbol(chainId);
    const value = Number(cost) / Number(10n ** BigInt(decimals));
    return `${value.toFixed(6)} ${symbol}`;
  }
};

/**
 * Obtient le symbole de la crypto-monnaie native d'une blockchain
 * @param chainId ID de la blockchain
 * @returns Symbole de la crypto-monnaie
 */
const getChainSymbol = (chainId: ChainId): string => {
  switch (chainId) {
    case ChainId.ETHEREUM:
      return 'ETH';
    case ChainId.BINANCE:
      return 'BNB';
    case ChainId.POLYGON:
      return 'MATIC';
    case ChainId.AVALANCHE:
      return 'AVAX';
    case ChainId.ARBITRUM:
      return 'ETH';
    default:
      return 'ETH';
  }
};
