import { BasePaymentService } from './BasePaymentService';
import { CryptocurrencyInfo } from '../../types/payment';

/**
 * Service de paiement pour Arbitrum
 * Implémente les fonctionnalités spécifiques à Arbitrum
 */
export class ArbitrumPaymentService extends BasePaymentService {
  /**
   * Constructeur
   * @param rpcUrl URL du RPC Arbitrum (optionnel)
   */
  constructor(rpcUrl?: string) {
    super(
      'arbitrum', 
      42161, // Arbitrum One Mainnet
    );
  }
  
  /**
   * Initialise les cryptomonnaies supportées sur Arbitrum
   */
  protected initSupportedCryptocurrencies(): void {
    // Crypto native (ETH sur Arbitrum)
    this.supportedCrypto['ETH'] = {
      symbol: 'ETH',
      address: null,
      name: 'Ethereum (Arbitrum)',
      decimals: 18,
      isNative: true,
      isStablecoin: false,
      logoUrl: '/assets/crypto/eth.png',
      minAmount: 5
    };
    
    // Stablecoins
    this.supportedCrypto['USDT'] = {
      symbol: 'USDT',
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      name: 'Tether USD (Arbitrum)',
      decimals: 6,
      isNative: false,
      isStablecoin: true,
      logoUrl: '/assets/crypto/usdt.png',
      minAmount: 5
    };
    
    this.supportedCrypto['USDC'] = {
      symbol: 'USDC',
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      name: 'USD Coin (Arbitrum)',
      decimals: 6,
      isNative: false,
      isStablecoin: true,
      logoUrl: '/assets/crypto/usdc.png',
      minAmount: 5
    };
    
    this.supportedCrypto['DAI'] = {
      symbol: 'DAI',
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      name: 'Dai Stablecoin (Arbitrum)',
      decimals: 18,
      isNative: false,
      isStablecoin: true,
      logoUrl: '/assets/crypto/dai.png',
      minAmount: 5
    };
  }
  
  /**
   * Récupère le symbole de la crypto native
   * @returns Symbole de la crypto native
   */
  protected getNativeSymbol(): string {
    return 'ETH';
  }
  
  /**
   * Récupère le nombre minimum de confirmations requis
   * @returns Nombre de confirmations
   */
  protected getMinConfirmations(): number {
    // Pour Arbitrum, on demande 3 confirmations
    return 3;
  }
  
  /**
   * Récupère le temps estimé pour une transaction
   * @returns Temps estimé en secondes
   */
  protected getEstimatedTransactionTime(): number {
    // Pour Arbitrum, environ 0.25-1 seconde par bloc
    return 3; // 3 blocs * 1 seconde
  }
}
