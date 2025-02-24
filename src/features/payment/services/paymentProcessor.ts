import { viem } from 'viem';

export type BlockchainNetwork = 'ethereum' | 'bsc' | 'polygon' | 'avalanche' | 'solana' | 'arbitrum';

export interface NetworkFees {
  launchpad: number;
  staking: number;
}

export class PaymentProcessor {
  private readonly NETWORK_FEES: Record<BlockchainNetwork, NetworkFees> = {
    ethereum: { launchpad: 0.03, staking: 0.05 },
    bsc: { launchpad: 0.02, staking: 0.04 },
    polygon: { launchpad: 0.02, staking: 0.04 },
    avalanche: { launchpad: 0.02, staking: 0.04 },
    solana: { launchpad: 0.015, staking: 0.03 },
    arbitrum: { launchpad: 0.015, staking: 0.03 }
  };

  async processLaunchpadFee(amount: bigint, network: BlockchainNetwork): Promise<bigint> {
    const fee = this.NETWORK_FEES[network].launchpad;
    return this.calculateFee(amount, fee);
  }

  async processStakingFee(amount: bigint, network: BlockchainNetwork): Promise<bigint> {
    const fee = this.NETWORK_FEES[network].staking;
    return this.calculateFee(amount, fee);
  }

  private calculateFee(amount: bigint, feePercentage: number): bigint {
    return amount * BigInt(Math.floor(feePercentage * 1000)) / BigInt(1000);
  }
}
