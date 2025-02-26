import { BlockchainNetwork } from '@/types/blockchain';
import { ServiceType } from '@/features/services/types/services';
import { logger } from '@/utils/firebase-logger';
import { CurrencyConverter } from './currencyConverter';

export class PaymentProcessor {
  private readonly NETWORK_FEES: Record<BlockchainNetwork, { launchpad: number; staking: number }> = {
    ethereum: { launchpad: 0.03, staking: 0.05 },
    bsc: { launchpad: 0.02, staking: 0.05 },
    polygon: { launchpad: 0.02, staking: 0.05 },
    avalanche: { launchpad: 0.02, staking: 0.05 },
    solana: { launchpad: 0.015, staking: 0.05 },
    arbitrum: { launchpad: 0.015, staking: 0.05 }
  };

  private readonly currencyConverter = CurrencyConverter.getInstance();

  async processServiceFee(
    serviceType: ServiceType,
    amount: bigint,
    network: BlockchainNetwork
  ): Promise<bigint> {
    try {
      switch (serviceType) {
        case ServiceType.LAUNCHPAD:
          return this.processLaunchpadFee(amount, network);
        case ServiceType.STAKING:
          return this.processStakingFee(amount, network);
        case ServiceType.MARKETING:
          return this.processMarketingFee(amount);
        case ServiceType.KYC:
          return this.processKYCFee();
        default:
          throw new Error('Service type non supporté');
      }
    } catch (error) {
      logger.error('Erreur lors du calcul des frais', { error, serviceType, network });
      throw error;
    }
  }

  private async processLaunchpadFee(amount: bigint, network: BlockchainNetwork): Promise<bigint> {
    const fee = this.NETWORK_FEES[network].launchpad;
    return this.calculateFee(amount, fee);
  }

  private async processStakingFee(amount: bigint, network: BlockchainNetwork): Promise<bigint> {
    const fee = this.NETWORK_FEES[network].staking;
    return this.calculateFee(amount, fee);
  }

  private async processMarketingFee(amount: bigint): Promise<bigint> {
    const baseFee = BigInt(5e17); // 0.5 BNB
    const listingCommission = 0.05; // 5%
    return baseFee + this.calculateFee(amount, listingCommission);
  }

  private async processKYCFee(): Promise<bigint> {
    try {
      // Convertir 50 USD en BNB
      const bnbAmount = await this.currencyConverter.convertUSDToBNB(50);
      return BigInt(Math.floor(bnbAmount * 1e18));
    } catch (error) {
      logger.error('Erreur lors du calcul des frais KYC', { error });
      throw error;
    }
  }

  private calculateFee(amount: bigint, feePercentage: number): bigint {
    return amount * BigInt(Math.floor(feePercentage * 1000)) / BigInt(1000);
  }
}
