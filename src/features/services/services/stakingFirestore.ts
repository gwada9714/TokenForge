import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { logger } from '@/utils/firebase-logger';
import { StakingPool, StakingReward } from './stakingRewards';

const POOLS_COLLECTION = 'stakingPools';
const REWARDS_COLLECTION = 'stakingRewards';

export const stakingFirestore = {
  async savePool(pool: StakingPool): Promise<void> {
    try {
      const poolRef = doc(collection(db, POOLS_COLLECTION), pool.id);
      await setDoc(poolRef, {
        ...pool,
        totalStaked: pool.totalStaked.toString(),
        rewardsDistributed: pool.rewardsDistributed.toString(),
        minStakeAmount: pool.minStakeAmount.toString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      logger.info('Pool de staking sauvegardé', { poolId: pool.id });
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde du pool de staking', { error, poolId: pool.id });
      throw error;
    }
  },

  async updatePool(pool: StakingPool): Promise<void> {
    try {
      const poolRef = doc(collection(db, POOLS_COLLECTION), pool.id);
      await updateDoc(poolRef, {
        ...pool,
        totalStaked: pool.totalStaked.toString(),
        rewardsDistributed: pool.rewardsDistributed.toString(),
        minStakeAmount: pool.minStakeAmount.toString(),
        updatedAt: serverTimestamp()
      });
      logger.info('Pool de staking mis à jour', { poolId: pool.id });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du pool de staking', { error, poolId: pool.id });
      throw error;
    }
  },

  async getPool(poolId: string): Promise<StakingPool | null> {
    try {
      const poolRef = doc(collection(db, POOLS_COLLECTION), poolId);
      const poolDoc = await getDoc(poolRef);
      
      if (!poolDoc.exists()) {
        return null;
      }

      const data = poolDoc.data();
      return {
        ...data,
        totalStaked: BigInt(data.totalStaked),
        rewardsDistributed: BigInt(data.rewardsDistributed),
        minStakeAmount: BigInt(data.minStakeAmount)
      } as StakingPool;
    } catch (error) {
      logger.error('Erreur lors de la récupération du pool de staking', { error, poolId });
      throw error;
    }
  },

  async saveReward(reward: StakingReward): Promise<void> {
    try {
      const rewardRef = doc(collection(db, REWARDS_COLLECTION));
      await setDoc(rewardRef, {
        ...reward,
        amount: reward.amount.toString(),
        createdAt: serverTimestamp()
      });
      logger.info('Récompense de staking sauvegardée', { 
        poolId: reward.poolId,
        userAddress: reward.userAddress 
      });
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde de la récompense', { 
        error, 
        poolId: reward.poolId,
        userAddress: reward.userAddress 
      });
      throw error;
    }
  },

  async getPoolRewards(poolId: string): Promise<StakingReward[]> {
    try {
      const rewardsQuery = query(
        collection(db, REWARDS_COLLECTION),
        where('poolId', '==', poolId),
        where('claimed', '==', false)
      );

      const rewardsDocs = await getDocs(rewardsQuery);
      return rewardsDocs.docs.map(doc => ({
        ...doc.data(),
        amount: BigInt(doc.data().amount)
      })) as StakingReward[];
    } catch (error) {
      logger.error('Erreur lors de la récupération des récompenses', { error, poolId });
      throw error;
    }
  }
}; 