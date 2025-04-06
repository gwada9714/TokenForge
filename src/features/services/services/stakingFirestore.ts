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
import { getFirebaseFirestoreSync } from '@/lib/firebase/firestore';
import { logger } from '@/core/logger';
import { StakingPool, StakingReward } from './stakingRewards';

const POOLS_COLLECTION = 'stakingPools';
const REWARDS_COLLECTION = 'stakingRewards';

export const stakingFirestore = {
  async savePool(pool: StakingPool): Promise<void> {
    try {
      const db = getFirebaseFirestoreSync();
      const poolRef = doc(collection(db, POOLS_COLLECTION), pool.id);
      await setDoc(poolRef, {
        ...pool,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      logger.info({ message: `Staking pool ${pool.id} saved successfully` });
    } catch (error) {
      logger.error({ message: `Error saving staking pool ${pool.id}`, error });
      throw error;
    }
  },

  async updatePool(pool: StakingPool): Promise<void> {
    try {
      const db = getFirebaseFirestoreSync();
      const poolRef = doc(collection(db, POOLS_COLLECTION), pool.id);
      await updateDoc(poolRef, {
        ...pool,
        updatedAt: serverTimestamp()
      });
      logger.info({ message: `Staking pool ${pool.id} updated successfully` });
    } catch (error) {
      logger.error({ message: `Error updating staking pool ${pool.id}`, error });
      throw error;
    }
  },

  async getPool(poolId: string): Promise<StakingPool | null> {
    try {
      const db = getFirebaseFirestoreSync();
      const poolRef = doc(collection(db, POOLS_COLLECTION), poolId);
      const poolDoc = await getDoc(poolRef);
      
      if (!poolDoc.exists()) {
        logger.warn({ message: `Staking pool ${poolId} not found` });
        return null;
      }
      
      const data = poolDoc.data() as StakingPool;
      logger.info({ message: `Staking pool ${poolId} retrieved successfully` });
      return {
        ...data,
        id: poolId,
      };
    } catch (error) {
      logger.error({ message: `Error getting staking pool ${poolId}`, error });
      throw error;
    }
  },

  async saveReward(reward: StakingReward): Promise<void> {
    try {
      const db = getFirebaseFirestoreSync();
      const rewardRef = doc(collection(db, REWARDS_COLLECTION));
      await setDoc(rewardRef, {
        ...reward,
        id: rewardRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      logger.info({ message: `Staking reward created successfully` });
      return;
    } catch (error) {
      logger.error({ message: `Error creating staking reward`, error });
      throw error;
    }
  },

  async getPoolRewards(poolId: string): Promise<StakingReward[]> {
    try {
      const db = getFirebaseFirestoreSync();
      const rewardsQuery = query(
        collection(db, REWARDS_COLLECTION),
        where('poolId', '==', poolId)
      );
      
      const rewardsDocs = await getDocs(rewardsQuery);
      const rewards: StakingReward[] = [];
      
      rewardsDocs.forEach((doc) => {
        const data = doc.data();
        rewards.push({
          id: doc.id,
          poolId: data.poolId,
          userAddress: data.userAddress,
          amount: data.amount,
          timestamp: data.timestamp,
          claimed: data.claimed
        } as StakingReward);
      });
      
      logger.info({ message: `Retrieved ${rewards.length} rewards for pool ${poolId}` });
      return rewards;
    } catch (error) {
      logger.error({ message: `Error getting rewards for pool ${poolId}`, error });
      throw error;
    }
  }
};