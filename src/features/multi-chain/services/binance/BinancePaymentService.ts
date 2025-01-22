import { Address } from 'viem';
import { BaseEVMPaymentService, EVMPaymentConfig } from '../payment/BaseEVMPaymentService';
import { PaymentNetwork } from '../payment/types/PaymentSession';

export type BinancePaymentConfig = EVMPaymentConfig;

export class BinancePaymentService extends BaseEVMPaymentService {
  private static instance: BinancePaymentService | null = null;

  private constructor(config: BinancePaymentConfig) {
    super(config);
    this.setupEventListeners();
  }

  public static getInstance(config?: BinancePaymentConfig): BinancePaymentService {
    if (!BinancePaymentService.instance && config) {
      BinancePaymentService.instance = new BinancePaymentService(config);
    } else if (!BinancePaymentService.instance) {
      throw new Error('BinancePaymentService not initialized');
    }
    return BinancePaymentService.instance;
  }

  public getNetwork(): PaymentNetwork {
    return PaymentNetwork.BINANCE;
  }

  public async payWithToken(
    tokenAddress: Address,
    amount: bigint,
    serviceType: string,
    sessionId: string,
    options: Record<string, any> = {}
  ): Promise<void> {
    await super.payWithToken(tokenAddress, amount, serviceType, sessionId, options);
  }

  public static resetInstance(): void {
    if (BinancePaymentService.instance) {
      BinancePaymentService.instance.cleanup();
      BinancePaymentService.instance = null;
    }
  }
}
