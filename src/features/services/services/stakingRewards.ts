import { logger } from "@/core/logger";
import { BlockchainNetwork } from "@/types/blockchain";
import { stakingFirestore } from "./stakingFirestore";
import { StakingContractService } from "./stakingContract";
import { type Address, type PublicClient, type WalletClient } from "viem";

export interface StakingPool {
  id: string;
  network: BlockchainNetwork;
  tokenAddress: string;
  apr: number;
  totalStaked: bigint;
  rewardsDistributed: bigint;
  stakingPeriod: number;
  minStakeAmount: bigint;
  isFlexible: boolean;
}

export interface StakingReward {
  poolId: string;
  userAddress: string;
  amount: bigint;
  timestamp: number;
  claimed: boolean;
}

export class StakingRewardsService {
  private static instance: StakingRewardsService;
  private readonly PLATFORM_FEE = 0.05; // 5% des récompenses
  private readonly stakingContractService: StakingContractService;
  private publicClient: PublicClient | null = null;
  private walletClient: WalletClient | null = null;

  private constructor() {
    this.stakingContractService = StakingContractService.getInstance();
  }

  public static getInstance(): StakingRewardsService {
    if (!StakingRewardsService.instance) {
      StakingRewardsService.instance = new StakingRewardsService();
    }
    return StakingRewardsService.instance;
  }

  public setClients(publicClient: PublicClient, walletClient: WalletClient) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.stakingContractService.setClients(publicClient, walletClient);
  }

  async createPool(
    network: BlockchainNetwork,
    tokenAddress: string,
    apr: number,
    stakingPeriod: number,
    minStakeAmount: bigint,
    isFlexible: boolean
  ): Promise<StakingPool> {
    try {
      if (!this.publicClient || !this.walletClient) {
        throw new Error("Clients non initialisés");
      }

      const pool: StakingPool = {
        id: this.generatePoolId(),
        network,
        tokenAddress,
        apr,
        totalStaked: 0n,
        rewardsDistributed: 0n,
        stakingPeriod,
        minStakeAmount,
        isFlexible,
      };

      await stakingFirestore.savePool(pool);
      return pool;
    } catch (error) {
      logger.error("Erreur lors de la création du pool", {
        error,
        network,
        tokenAddress,
      });
      throw error;
    }
  }

  async distributeRewards(poolId: string): Promise<void> {
    try {
      if (!this.publicClient || !this.walletClient) {
        throw new Error("Clients non initialisés");
      }

      const pool = await stakingFirestore.getPool(poolId);
      if (!pool) {
        throw new Error("Pool non trouvé");
      }

      const stakingRewards = await this.calculateRewards(pool);

      for (const reward of stakingRewards) {
        const platformFee = this.calculatePlatformFee(reward.amount);
        const userReward = reward.amount - platformFee;

        await stakingFirestore.saveReward({
          ...reward,
          amount: userReward,
        });

        await this.stakingContractService.transferRewards(
          reward.userAddress as Address,
          userReward,
          pool.tokenAddress as Address
        );
        await this.stakingContractService.collectPlatformFee(
          platformFee,
          pool.tokenAddress as Address
        );
      }

      pool.rewardsDistributed =
        pool.rewardsDistributed +
        stakingRewards.reduce((total, reward) => total + reward.amount, 0n);

      await stakingFirestore.updatePool(pool);
    } catch (error) {
      logger.error("Erreur lors de la distribution des récompenses", {
        error,
        poolId,
      });
      throw error;
    }
  }

  private generatePoolId(): string {
    return `pool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculatePlatformFee(amount: bigint): bigint {
    return (amount * BigInt(Math.floor(this.PLATFORM_FEE * 10000))) / 10000n;
  }

  private async calculateRewards(pool: StakingPool): Promise<StakingReward[]> {
    const rewards = await stakingFirestore.getPoolRewards(pool.id);
    const currentTime = Date.now();

    // Calculer les récompenses basées sur l'APR et la période de staking
    const annualRewardRate = pool.apr / 100;
    const dailyRewardRate = annualRewardRate / 365;

    return rewards.map((reward) => {
      const stakingDuration = currentTime - reward.timestamp;
      const daysStaked = stakingDuration / (24 * 60 * 60 * 1000);
      const rewardAmount =
        (reward.amount *
          BigInt(Math.floor(dailyRewardRate * daysStaked * 10000))) /
        10000n;

      return {
        ...reward,
        amount: rewardAmount,
      };
    });
  }
}
