import { PublicClient, WalletClient } from "viem";
import {
  TokenConfig,
  DeploymentResult,
  ValidationResult,
  CostEstimation,
  TokenDeploymentOptions,
} from "../../../types/deployment";
import { BlockchainNetwork } from "../components/DeploymentOptions";
import { PaymentProcessor } from "@/features/payment/services/paymentProcessor";
import { errorService } from "@/core/errors/ErrorService";
import { logger } from "@/core/logger";
import { configService } from "@/core/config";
import { TokenFactoryABI } from "../abis/TokenFactoryABI";

export class TokenDeploymentService {
  private paymentProcessor: PaymentProcessor;

  constructor(
    private readonly publicClient: PublicClient,
    private readonly walletClient: WalletClient
  ) {
    this.paymentProcessor = new PaymentProcessor();
  }

  async validateTokenConfig(config: TokenConfig): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!config.name || config.name.length < 3) {
      errors.push("Le nom du token doit faire au moins 3 caractères");
    }

    if (!config.symbol || config.symbol.length < 2) {
      errors.push("Le symbole du token doit faire au moins 2 caractères");
    }

    if (config.initialSupply <= BigInt(0)) {
      errors.push("Le supply initial doit être supérieur à 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async estimateDeploymentCost(config: TokenConfig): Promise<CostEstimation> {
    // Estimation des coûts de déploiement
    const gasEstimate = await this.publicClient.estimateContractGas({
      abi: [], // TODO: Add ABI
      bytecode: "", // TODO: Add bytecode
      args: [config.name, config.symbol, config.decimals, config.initialSupply],
    });

    return {
      gasCost: gasEstimate,
      tokenPrice: BigInt(0), // TODO: Add token price calculation
      totalCost: gasEstimate, // TODO: Add total cost calculation
    };
  }

  async deployToken(
    config: TokenConfig,
    options: TokenDeploymentOptions = { chain: "bsc" }
  ): Promise<DeploymentResult> {
    try {
      logger.info({
        category: "TokenDeployment",
        message: "Démarrage du déploiement de token",
        data: {
          tokenName: config.name,
          tokenSymbol: config.symbol,
          network: options.chain,
          verifyContract: options.verifyContract,
        },
      });

      // Validation de la configuration
      const validation = await this.validateTokenConfig(config);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(", "),
        };
      }

      // Déploiement du contrat
      const hash = await this.walletClient.deployContract({
        abi: [], // TODO: Add ABI
        bytecode: "", // TODO: Add bytecode
        args: [
          config.name,
          config.symbol,
          config.decimals,
          config.initialSupply,
        ],
      });

      // Attente de la confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
      });

      if (!receipt.contractAddress) {
        throw new Error("Adresse du contrat non trouvée dans le reçu");
      }

      return {
        success: true,
        tokenAddress: receipt.contractAddress,
        transactionHash: hash,
      };
    } catch (error) {
      logger.error({
        category: "TokenDeployment",
        message: "Erreur lors du déploiement du token",
        error: error instanceof Error ? error : new Error(String(error)),
        data: {
          tokenName: config.name,
          tokenSymbol: config.symbol,
          network: options.chain,
        },
      });

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur inconnue lors du déploiement",
      };
    }
  }

  private async calculateDeploymentFee(
    network: BlockchainNetwork
  ): Promise<bigint> {
    const baseFee = this.getBaseDeploymentFee(network);
    return await this.paymentProcessor.processLaunchpadFee(baseFee, network);
  }

  private getBaseDeploymentFee(network: BlockchainNetwork): bigint {
    const fees: Record<BlockchainNetwork, bigint> = {
      ethereum: BigInt(100000000000000000), // 0.1 ETH
      bsc: BigInt(50000000000000000), // 0.05 BNB
      polygon: BigInt(50000000000000000), // 50 MATIC
      avalanche: BigInt(1000000000000000000), // 1 AVAX
      solana: BigInt(500000000), // 0.5 SOL
      arbitrum: BigInt(10000000000000000), // 0.01 ETH
    };
    return fees[network];
  }

  private getNetworkRPC(network: BlockchainNetwork): string {
    const web3Config = configService.getWeb3Config();
    const rpcs: Record<BlockchainNetwork, string> = {
      ethereum: web3Config.rpcUrls.ethereum || "",
      bsc: web3Config.rpcUrls.bsc || "",
      polygon: web3Config.rpcUrls.polygon || "",
      avalanche: web3Config.rpcUrls.avalanche || "",
      solana: web3Config.rpcUrls.solana || "",
      arbitrum: web3Config.rpcUrls.arbitrum || "",
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
      Math.floor(config.customTaxPercentage * 100), // Convert to basis points
    ];
  }

  private async deployContract(
    network: BlockchainNetwork,
    args: any[],
    walletAddress: `0x${string}`
  ): Promise<DeploymentResult> {
    try {
      logger.info({
        category: "TokenDeployment",
        message: "Démarrage du déploiement de contrat",
        data: { network, walletAddress },
      });
      // Créer le client avec le bon RPC
      const client = this.publicClient;

      // Créer le wallet client
      const walletClient = this.walletClient;

      // Vérifier les fonds
      const balance = await client.getBalance({ address: walletAddress });
      const deploymentFee = await this.calculateDeploymentFee(network);
      if (balance < deploymentFee) {
        throw new Error("Fonds insuffisants pour le déploiement");
      }

      // Déployer le contrat
      const { request } = await client.simulateContract({
        account: walletAddress,
        address: this.getFactoryAddress(network),
        abi: TokenFactoryABI,
        functionName: "deployToken",
        args,
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await client.waitForTransactionReceipt({ hash });

      if (!receipt.status || !receipt.contractAddress) {
        throw new Error("Échec du déploiement du contrat");
      }

      return {
        success: true,
        tokenAddress: receipt.contractAddress,
        transactionHash: hash,
      };
    } catch (error) {
      const errorDetails = errorService.handleError(error, {
        network,
        walletAddress,
        args,
      });

      return {
        success: false,
        error: errorDetails.message,
      };
    }
  }

  private getFactoryAddress(network: BlockchainNetwork): string {
    const web3Config = configService.getWeb3Config();
    const contractAddresses = web3Config.contractAddresses || {};
    const factoryAddressKey = `TOKEN_FACTORY_${network.toUpperCase()}`;

    // Récupérer l'adresse du contrat de factory pour le réseau spécifié
    const factoryAddress =
      (contractAddresses[factoryAddressKey] as string) || "";

    if (!factoryAddress) {
      logger.warn({
        category: "TokenDeployment",
        message: `Adresse de factory non trouvée pour le réseau ${network}`,
        data: { network, factoryAddressKey },
      });
      return "0x1234567890abcdef"; // Adresse par défaut pour la compatibilité
    }

    return factoryAddress;
  }
}
