import { Address } from 'viem';
import { BaseEVMPaymentService, EVMPaymentConfig, EVMPaymentOptions } from '../payment/BaseEVMPaymentService';
import { PaymentNetwork, PaymentStatus } from '../payment/types/PaymentSession';
import { PAYMENT_CONTRACT_ABI } from '../payment/abis/TokenABI';

export type PolygonPaymentConfig = EVMPaymentConfig;

export class PolygonPaymentService extends BaseEVMPaymentService {
  private static instance: PolygonPaymentService | null = null;

  private constructor(config: PolygonPaymentConfig) {
    super(config);
    this.setupEventListeners();
  }

  public static getInstance(config?: PolygonPaymentConfig): PolygonPaymentService {
    if (!PolygonPaymentService.instance && config) {
      PolygonPaymentService.instance = new PolygonPaymentService(config);
    } else if (!PolygonPaymentService.instance) {
      throw new Error('PolygonPaymentService not initialized');
    }
    return PolygonPaymentService.instance;
  }

  public getNetwork(): PaymentNetwork {
    return PaymentNetwork.POLYGON;
  }

  public override async payWithToken(
    tokenAddress: Address,
    amount: bigint,
    serviceType: string,
    sessionId: string,
    options: EVMPaymentOptions = {}
  ): Promise<void> {
    try {
      // Pour Polygon, nous ajoutons des estimations de gas spécifiques au réseau
      const polygonOptions: EVMPaymentOptions = {
        ...options,
        maxFeePerGas: options.maxFeePerGas || await this.estimateMaxFeePerGas(),
        maxPriorityFeePerGas: options.maxPriorityFeePerGas || await this.estimatePriorityFee(),
        gasLimit: options.gasLimit || await this.estimateGasLimit(tokenAddress, amount)
      };

      await super.payWithToken(tokenAddress, amount, serviceType, sessionId, polygonOptions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Payment failed: ${errorMessage}`);
    }
  }

  private async estimateMaxFeePerGas(): Promise<bigint> {
    const block = await this.config.publicClient.getBlock();
    // Ajouter 30% de marge au baseFeePerGas pour Polygon
    return (block.baseFeePerGas || 0n) * 130n / 100n;
  }

  private async estimatePriorityFee(): Promise<bigint> {
    try {
      const priorityFee = await this.config.publicClient.estimateMaxPriorityFeePerGas();
      return priorityFee;
    } catch {
      // Fallback à 30 Gwei si l'estimation échoue (Polygon a des gas fees plus élevés)
      return 30000000000n;
    }
  }

  private async estimateGasLimit(tokenAddress: Address, amount: bigint): Promise<bigint> {
    try {
      const gasLimit = await this.config.publicClient.estimateContractGas({
        address: this.config.contractAddress,
        abi: ['function payWithToken(address token, uint256 amount) payable'],
        functionName: 'payWithToken',
        args: [tokenAddress, amount],
        account: this.config.walletClient.account,
      });
      // Ajouter 20% de marge au gasLimit
      return (gasLimit * 120n) / 100n;
    } catch {
      // Fallback à 300000 gas si l'estimation échoue
      return 300000n;
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
    if (PolygonPaymentService.instance) {
      PolygonPaymentService.instance.cleanup();
      PolygonPaymentService.instance = null;
    }
  }
}
