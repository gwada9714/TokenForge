import { IPaymentService } from './IPaymentService';
import { BasePaymentService } from './BasePaymentService';
import { EthereumPaymentService } from './EthereumPaymentService';
import { BSCPaymentService } from './BSCPaymentService';
import { PolygonPaymentService } from './PolygonPaymentService';
import { AvalanchePaymentService } from './AvalanchePaymentService';
import { SolanaPaymentService } from './SolanaPaymentService';
import { ArbitrumPaymentService } from './ArbitrumPaymentService';

/**
 * Crée un service de paiement pour une blockchain donnée
 * @param network Nom de la blockchain
 * @returns Service de paiement
 */
export function createPaymentService(network: string): IPaymentService {
  switch (network.toLowerCase()) {
    case 'ethereum':
      return new EthereumPaymentService();
    case 'binance':
    case 'bsc':
      return new BSCPaymentService();
    case 'polygon':
      return new PolygonPaymentService();
    case 'avalanche':
      return new AvalanchePaymentService();
    case 'solana':
      return new SolanaPaymentService();
    case 'arbitrum':
      return new ArbitrumPaymentService();
    default:
      throw new Error(`Unsupported blockchain network: ${network}`);
  }
}

export {
  IPaymentService,
  BasePaymentService,
  EthereumPaymentService,
  BSCPaymentService,
  PolygonPaymentService,
  AvalanchePaymentService,
  SolanaPaymentService,
  ArbitrumPaymentService
};
