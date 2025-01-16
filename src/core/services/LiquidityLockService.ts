import { ethers } from 'ethers';
import { NetworkConfig } from '@/config/networks';
import { LiquidityLock } from '@/types/tokenFeatures';
import { LIQUIDITY_LOCKER_ABI } from '@/abi/LiquidityLockerABI';

export class LiquidityLockService {
  private provider: ethers.JsonRpcProvider;
  private lockContract: ethers.Contract;

  constructor(network: NetworkConfig) {
    this.provider = new ethers.JsonRpcProvider(network.chain.rpcUrls.default);
    
    if (!network.contracts.liquidityLocker) {
      throw new Error('Liquidity locker contract address not configured for this network');
    }

    this.lockContract = new ethers.Contract(
      network.contracts.liquidityLocker,
      LIQUIDITY_LOCKER_ABI,
      this.provider
    );
  }

  async lockLiquidity(
    tokenAddress: string,
    pairAddress: string,
    lockConfig: LiquidityLock,
    signer: ethers.Signer
  ): Promise<string> {
    try {
      const lockAmount = ethers.parseUnits(lockConfig.amount, 18);
      const unlockTime = Math.floor(lockConfig.unlockDate.getTime() / 1000);

      const contract = this.lockContract.connect(signer);
      const tx = await contract.lockLiquidity(
        tokenAddress,
        pairAddress,
        lockAmount,
        unlockTime,
        lockConfig.beneficiary
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error locking liquidity:', error);
      throw new Error('Failed to lock liquidity');
    }
  }

  async getLockInfo(tokenAddress: string, pairAddress: string): Promise<{
    amount: string;
    unlockDate: Date;
    beneficiary: string;
  }> {
    try {
      const lockInfo = await this.lockContract.getLockInfo(tokenAddress, pairAddress);
      return {
        amount: ethers.formatUnits(lockInfo.amount, 18),
        unlockDate: new Date(Number(lockInfo.unlockTime) * 1000),
        beneficiary: lockInfo.beneficiary
      };
    } catch (error) {
      console.error('Error getting lock info:', error);
      throw new Error('Failed to get lock information');
    }
  }

  async extendLock(
    tokenAddress: string,
    pairAddress: string,
    newUnlockDate: Date,
    signer: ethers.Signer
  ): Promise<string> {
    try {
      const newUnlockTime = Math.floor(newUnlockDate.getTime() / 1000);
      const contract = this.lockContract.connect(signer);
      const tx = await contract.extendLockTime(
        tokenAddress,
        pairAddress,
        newUnlockTime
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error extending lock:', error);
      throw new Error('Failed to extend lock');
    }
  }
}
