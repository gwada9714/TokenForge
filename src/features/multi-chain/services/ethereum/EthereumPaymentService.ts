import { Address } from 'viem';
import { BaseEVMPaymentService, EVMPaymentConfig, EVMPaymentOptions } from '../payment/BaseEVMPaymentService';
import { PaymentNetwork, PaymentStatus } from '../payment/types/PaymentSession';
import { PAYMENT_CONTRACT_ABI } from '../payment/abis/TokenABI';

export type EthereumPaymentConfig = EVMPaymentConfig;

export class EthereumPaymentService extends BaseEVMPaymentService {
  private static instance: EthereumPaymentService | null = null;

  private constructor(config: EthereumPaymentConfig) {
    super(config);
    this.setupEventListeners();
  }

  public static getInstance(config?: EthereumPaymentConfig): EthereumPaymentService {
    if (!EthereumPaymentService.instance && config) {
      EthereumPaymentService.instance = new EthereumPaymentService(config);
    } else if (!EthereumPaymentService.instance) {
      throw new Error('EthereumPaymentService not initialized');
    }
    return EthereumPaymentService.instance;
  }

  public getNetwork(): PaymentNetwork {
    return PaymentNetwork.ETHEREUM;
  }

  public override async payWithToken(
    tokenAddress: Address,
    amount: bigint,
    serviceType: string,
    sessionId: string,
    options: EVMPaymentOptions = {}
  ): Promise<void> {
    try {
      // Pour Ethereum, nous ajoutons des estimations de gas spécifiques
      const ethOptions: EVMPaymentOptions = {
        ...options,
        maxFeePerGas: options.maxFeePerGas || await this.estimateMaxFeePerGas(),
        maxPriorityFeePerGas: options.maxPriorityFeePerGas || await this.estimatePriorityFee()
      };

      await super.payWithToken(tokenAddress, amount, serviceType, sessionId, ethOptions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Payment failed: ${errorMessage}`);
    }
  }

  private async estimateMaxFeePerGas(): Promise<bigint> {
    const block = await this.config.publicClient.getBlock();
    // Ajouter 20% de marge au baseFeePerGas
    return (block.baseFeePerGas || 0n) * 120n / 100n;
  }

  private async estimatePriorityFee(): Promise<bigint> {
    try {
      const priorityFee = await this.config.publicClient.estimateMaxPriorityFeePerGas();
      return priorityFee;
    } catch {
      // Fallback à 1.5 Gwei si l'estimation échoue
      return 1500000000n;
    }
  }

  protected override setupEventListeners(): void {
    const unwatch = this.config.publicClient.watchContractEvent({
      address: this.config.contractAddress,
      abi: PAYMENT_CONTRACT_ABI,
      eventName: 'PaymentReceived',
      onLogs: (logs) => {
        for (const log of logs) {
          const { sessionId } = log.args;
          if (sessionId) {
            this.sessionService.updateSessionStatus(
              sessionId,
              PaymentStatus.CONFIRMED,
              log.transactionHash
            );
          }
        }
      },
    });

    this.cleanupFunctions.push(unwatch);
  }

  public static resetInstance(): void {
    if (EthereumPaymentService.instance) {
      EthereumPaymentService.instance.cleanup();
      EthereumPaymentService.instance = null;
    }
  }
}
