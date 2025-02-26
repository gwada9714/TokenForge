import { 
  type PublicClient, 
  type WalletClient, 
  type Address,
  type Account,
  type Chain,
  getContract
} from 'viem';
import { logger } from '@/utils/firebase-logger';

const STAKING_ABI = [
  // View functions
  {
    name: 'stakedAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'pendingRewards',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'totalStaked',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'rewardRate',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  // State-changing functions
  {
    name: 'stake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'recipient', type: 'address' }
    ],
    outputs: [{ type: 'bool' }]
  },
  {
    name: 'unstake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'bool' }]
  },
  {
    name: 'claimRewards',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'recipient', type: 'address' }],
    outputs: [{ type: 'bool' }]
  }
] as const;

export class StakingContractService {
  private static instance: StakingContractService;
  private publicClient: PublicClient | null = null;
  private walletClient: WalletClient | null = null;

  private constructor() {}

  public static getInstance(): StakingContractService {
    if (!StakingContractService.instance) {
      StakingContractService.instance = new StakingContractService();
    }
    return StakingContractService.instance;
  }

  public setClients(publicClient: PublicClient, walletClient: WalletClient) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  private getContract(contractAddress: Address) {
    if (!this.publicClient || !this.walletClient) {
      throw new Error('Clients non initialisés');
    }

    return getContract({
      address: contractAddress,
      abi: STAKING_ABI,
      client: {
        public: this.publicClient,
        wallet: this.walletClient
      }
    });
  }

  async transferRewards(
    userAddress: Address,
    amount: bigint,
    tokenAddress: Address
  ): Promise<void> {
    try {
      if (!this.walletClient?.account?.address) {
        throw new Error('Wallet non connecté');
      }

      const contract = this.getContract(tokenAddress);
      const { request } = await contract.simulate.stake([amount, userAddress], {
        account: this.walletClient.account.address,
        chain: this.walletClient.chain
      });
      const hash = await contract.write.stake([amount, userAddress], {
        account: this.walletClient.account.address,
        chain: this.walletClient.chain
      });
      
      // Attendre la confirmation de la transaction
      const receipt = await this.publicClient!.waitForTransactionReceipt({ hash });
      
      logger.info('Récompenses transférées avec succès', { 
        userAddress, 
        amount: amount.toString(),
        transactionHash: receipt.transactionHash 
      });
    } catch (error) {
      logger.error('Erreur lors du transfert des récompenses', { 
        error, 
        userAddress, 
        amount: amount.toString() 
      });
      throw error;
    }
  }

  async collectPlatformFee(
    amount: bigint,
    tokenAddress: Address
  ): Promise<void> {
    try {
      if (!this.walletClient?.account?.address) {
        throw new Error('Wallet non connecté');
      }

      const contract = this.getContract(tokenAddress);
      const platformAddress = this.walletClient.account.address;
      const { request } = await contract.simulate.claimRewards([platformAddress], {
        account: platformAddress,
        chain: this.walletClient.chain
      });
      const hash = await contract.write.claimRewards([platformAddress], {
        account: platformAddress,
        chain: this.walletClient.chain
      });
      
      // Attendre la confirmation de la transaction
      const receipt = await this.publicClient!.waitForTransactionReceipt({ hash });
      
      logger.info('Frais de plateforme collectés avec succès', { 
        amount: amount.toString(),
        transactionHash: receipt.transactionHash 
      });
    } catch (error) {
      logger.error('Erreur lors de la collecte des frais de plateforme', { 
        error, 
        amount: amount.toString() 
      });
      throw error;
    }
  }
} 