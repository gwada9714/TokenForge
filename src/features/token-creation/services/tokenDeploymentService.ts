import { createPublicClient, createWalletClient, http, type TransactionReceipt } from 'viem';
import { BlockchainNetwork } from '../components/DeploymentOptions';
import { PaymentProcessor } from '@/features/payment/services/paymentProcessor';
import { ErrorService } from '@/services/errorService';
import { TokenFactoryABI } from '../abis/TokenFactoryABI';

interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: bigint;
  mintable: boolean;
  burnable: boolean;
  blacklist: boolean;
  customTaxPercentage: number;
}

interface DeploymentResult {
  success: boolean;
  tokenAddress?: `0x${string}`;
  transactionHash?: `0x${string}`;
  error?: string;
}

export class TokenDeploymentService {
  private paymentProcessor: PaymentProcessor;

  constructor() {
    this.paymentProcessor = new PaymentProcessor();
  }

  async deployToken(
    network: BlockchainNetwork,
    config: TokenConfig,
    walletAddress: `0x${string}`
  ): Promise<DeploymentResult> {
    try {
      // Vérifier le paiement des frais de déploiement
      const deploymentFee = await this.calculateDeploymentFee(network);
      
      // Créer le client pour interagir avec la blockchain
      const publicClient = createPublicClient({
        transport: http(this.getNetworkRPC(network))
      });

      // Préparer les arguments du contrat
      const contractArgs = this.prepareContractArguments(config);

      // Déployer le contrat
      const deploymentResult = await this.deployContract(network, contractArgs, walletAddress);

      // Vérifier le succès du déploiement
      if (!deploymentResult.success) {
        throw new Error(deploymentResult.error || 'Échec du déploiement');
      }

      return {
        success: true,
        tokenAddress: deploymentResult.tokenAddress,
        transactionHash: deploymentResult.transactionHash
      };

    } catch (error) {
      console.error('Erreur lors du déploiement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  private async calculateDeploymentFee(network: BlockchainNetwork): Promise<bigint> {
    const baseFee = this.getBaseDeploymentFee(network);
    return await this.paymentProcessor.processLaunchpadFee(baseFee, network);
  }

  private getBaseDeploymentFee(network: BlockchainNetwork): bigint {
    const fees: Record<BlockchainNetwork, bigint> = {
      ethereum: BigInt(100000000000000000), // 0.1 ETH
      bsc: BigInt(50000000000000000),      // 0.05 BNB
      polygon: BigInt(50000000000000000),   // 50 MATIC
      avalanche: BigInt(1000000000000000000), // 1 AVAX
      solana: BigInt(500000000),            // 0.5 SOL
      arbitrum: BigInt(10000000000000000)   // 0.01 ETH
    };
    return fees[network];
  }

  private getNetworkRPC(network: BlockchainNetwork): string {
    const rpcs: Record<BlockchainNetwork, string> = {
      ethereum: process.env.NEXT_PUBLIC_ETH_RPC_URL || '',
      bsc: process.env.NEXT_PUBLIC_BSC_RPC_URL || '',
      polygon: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || '',
      avalanche: process.env.NEXT_PUBLIC_AVAX_RPC_URL || '',
      solana: process.env.NEXT_PUBLIC_SOL_RPC_URL || '',
      arbitrum: process.env.NEXT_PUBLIC_ARB_RPC_URL || ''
    };
    return rpcs[network];
  }

  private prepareContractArguments(config: TokenConfig): any[] {
    return [
      config.name,
      config.symbol,
      config.decimals,
      config.initialSupply,
      config.mintable,
      config.burnable,
      config.blacklist,
      Math.floor(config.customTaxPercentage * 100) // Convert to basis points
    ];
  }

  private async deployContract(
    network: BlockchainNetwork,
    args: any[],
    walletAddress: `0x${string}`
  ): Promise<DeploymentResult> {
    const errorService = ErrorService.getInstance();
    try {
      // Créer le client avec le bon RPC
      const client = createPublicClient({
        transport: http(this.getNetworkRPC(network))
      });

      // Créer le wallet client
      const walletClient = createWalletClient({
        transport: http(this.getNetworkRPC(network)),
        account: walletAddress
      });

      // Vérifier les fonds
      const balance = await client.getBalance({ address: walletAddress });
      const deploymentFee = await this.calculateDeploymentFee(network);
      if (balance < deploymentFee) {
        throw new Error('Fonds insuffisants pour le déploiement');
      }

      // Déployer le contrat
      const { request } = await client.simulateContract({
        account: walletAddress,
        address: this.getFactoryAddress(network),
        abi: TokenFactoryABI,
        functionName: 'deployToken',
        args
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await client.waitForTransactionReceipt({ hash });

      if (!receipt.status || !receipt.contractAddress) {
        throw new Error('Échec du déploiement du contrat');
      }

      return {
        success: true,
        tokenAddress: receipt.contractAddress,
        transactionHash: hash
      };

    } catch (error) {
      const errorDetails = errorService.handleError(error, {
        network,
        walletAddress,
        args
      });

      return {
        success: false,
        error: errorDetails.message
      };
    }
  }

  private getFactoryAddress(network: BlockchainNetwork): string {
    // Cette méthode devrait retourner l'adresse du contrat de factory pour le réseau spécifié
    // Pour l'exemple, on utilise une adresse fictive
    return '0x1234567890abcdef';
  }
}
