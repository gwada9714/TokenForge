import { EthereumBlockchainService, EthereumPaymentService, EthereumTokenService } from './adapters/ethereum';
import { BinanceBlockchainService, BinancePaymentService, BinanceTokenService } from './adapters/binance';
import { PolygonBlockchainService, PolygonPaymentService, PolygonTokenService } from './adapters/polygon';
import { AvalancheBlockchainService, AvalanchePaymentService, AvalancheTokenService } from './adapters/avalanche';
import { ArbitrumBlockchainService, ArbitrumPaymentService, ArbitrumTokenService } from './adapters/arbitrum';
import { SolanaBlockchainService, SolanaPaymentService, SolanaTokenService } from './adapters/solana';

/**
 * Factory pour créer des services blockchain
 * Permet de créer des services spécifiques à chaque blockchain
 */
export const createBlockchainService = (chainName: string, walletProvider?: any) => {
  switch (chainName.toLowerCase()) {
    case 'ethereum':
      return new EthereumBlockchainService(walletProvider);
    case 'binance':
      return new BinanceBlockchainService(walletProvider);
    case 'polygon':
      return new PolygonBlockchainService(walletProvider);
    case 'avalanche':
      return new AvalancheBlockchainService(walletProvider);
    case 'arbitrum':
      return new ArbitrumBlockchainService(walletProvider);
    case 'solana':
      return new SolanaBlockchainService(walletProvider);
    default:
      throw new Error(`Unsupported blockchain: ${chainName}`);
  }
};

/**
 * Factory pour créer des services de paiement
 * Permet de créer des services de paiement spécifiques à chaque blockchain
 */
export const createPaymentService = (chainName: string, walletProvider?: any) => {
  switch (chainName.toLowerCase()) {
    case 'ethereum':
      return new EthereumPaymentService(walletProvider);
    case 'binance':
      return new BinancePaymentService(walletProvider);
    case 'polygon':
      return new PolygonPaymentService(walletProvider);
    case 'avalanche':
      return new AvalanchePaymentService(walletProvider);
    case 'arbitrum':
      return new ArbitrumPaymentService(walletProvider);
    case 'solana':
      return new SolanaPaymentService(walletProvider);
    default:
      throw new Error(`Unsupported blockchain for payments: ${chainName}`);
  }
};

/**
 * Factory pour créer des services de gestion des tokens
 * Permet de créer des services de token spécifiques à chaque blockchain
 */
export const createTokenService = (chainName: string, walletProvider?: any) => {
  switch (chainName.toLowerCase()) {
    case 'ethereum':
      return new EthereumTokenService(walletProvider);
    case 'binance':
      return new BinanceTokenService(walletProvider);
    case 'polygon':
      return new PolygonTokenService(walletProvider);
    case 'avalanche':
      return new AvalancheTokenService(walletProvider);
    case 'arbitrum':
      return new ArbitrumTokenService(walletProvider);
    case 'solana':
      return new SolanaTokenService(walletProvider);
    default:
      throw new Error(`Unsupported blockchain for tokens: ${chainName}`);
  }
};
