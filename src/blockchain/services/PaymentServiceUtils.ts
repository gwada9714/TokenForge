/**
 * Utilitaires pour le service de paiement
 * Contient les méthodes manquantes dans PaymentService
 */

/**
 * Récupère le nombre minimum de confirmations requis pour une blockchain
 * @param chainName Nom de la blockchain
 * @returns Nombre de confirmations
 */
export function getMinConfirmations(chainName: string): number {
  switch (chainName.toLowerCase()) {
    case 'ethereum':
      return 12; // Ethereum nécessite plus de confirmations
    case 'binance':
    case 'bsc':
      return 15; // BSC nécessite beaucoup de confirmations
    case 'polygon':
      return 64; // Polygon nécessite beaucoup de confirmations
    case 'avalanche':
      return 12; // Avalanche
    case 'arbitrum':
      return 12; // Arbitrum
    case 'solana':
      return 32; // Solana
    default:
      return 12; // Par défaut
  }
}

/**
 * Estime le temps de transaction en secondes pour une blockchain
 * @param chainName Nom de la blockchain
 * @returns Temps estimé en secondes
 */
export function getEstimatedTransactionTime(chainName: string): number {
  switch (chainName.toLowerCase()) {
    case 'ethereum':
      return 180; // ~3 minutes
    case 'binance':
    case 'bsc':
      return 15; // ~15 secondes
    case 'polygon':
      return 10; // ~10 secondes
    case 'avalanche':
      return 5; // ~5 secondes
    case 'arbitrum':
      return 15; // ~15 secondes
    case 'solana':
      return 2; // ~2 secondes
    default:
      return 60; // Par défaut 1 minute
  }
}

/**
 * Récupère l'ID de la chaîne pour une blockchain
 * @param chainName Nom de la blockchain
 * @returns ID de la chaîne
 */
export function getChainId(chainName: string): number {
  switch (chainName.toLowerCase()) {
    case 'ethereum':
      return 1; // Ethereum Mainnet
    case 'binance':
    case 'bsc':
      return 56; // Binance Smart Chain
    case 'polygon':
      return 137; // Polygon
    case 'avalanche':
      return 43114; // Avalanche C-Chain
    case 'arbitrum':
      return 42161; // Arbitrum One
    case 'solana':
      return 0; // Solana n'a pas d'ID de chaîne EVM
    default:
      return 1; // Par défaut Ethereum
  }
}
