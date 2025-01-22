import { ethers, BigNumber } from 'ethers';
import { BinancePaymentContract } from './contracts/BinancePayment';
import { PaymentSessionService } from '../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus } from '../payment/types/PaymentSession';
import { BasePaymentService, PaymentAmount, PaymentOptions } from '../payment/types/PaymentService';
import { validatePaymentParams } from '../payment/utils/paymentValidation';

export interface BinancePaymentConfig {
  contractAddress: string;
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
  receiverAddress: string;
}

export class BinancePaymentService implements BasePaymentService {
  private static instance: BinancePaymentService;
  private contract: BinancePaymentContract;
  private sessionService: PaymentSessionService;
  private config: BinancePaymentConfig;

  private constructor(config: BinancePaymentConfig) {
    this.config = config;
    this.contract = new BinancePaymentContract(config.contractAddress, config.signer);
    this.sessionService = PaymentSessionService.getInstance();
    this.setupEventListeners();
  }

  public static getInstance(config?: BinancePaymentConfig): BinancePaymentService {
    if (!BinancePaymentService.instance) {
      if (!config) {
        throw new Error('Configuration required for initialization');
      }
      BinancePaymentService.instance = new BinancePaymentService(config);
    }
    return BinancePaymentService.instance;
  }

  private setupEventListeners(): void {
    this.contract.on('PaymentProcessed', async (payer: string, amount: BigNumber, sessionId: string) => {
      try {
        await this.sessionService.updateSessionStatus(
          sessionId,
          PaymentStatus.CONFIRMED,
          payer
        );
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    });
  }

  public async payWithToken(
    tokenAddress: string,
    amount: PaymentAmount,
    serviceType: string,
    userId: string,
    options: PaymentOptions
  ): Promise<string> {
    validatePaymentParams(amount, options);

    try {
      // Verify token is supported
      const isSupported = await this.isTokenSupported(tokenAddress);
      if (!isSupported) {
        throw new Error('Token not supported');
      }

      // Create payment session
      const session = this.sessionService.createSession(
        userId,
        PaymentNetwork.BINANCE,
        {
          address: tokenAddress,
          amount: amount instanceof BigNumber ? amount : BigNumber.from(amount.toString()),
          serviceType
        }
      );

      // Prepare transaction options
      const txOptions: ethers.PayableOverrides = {
        gasLimit: options.gasLimit,
        gasPrice: options.gasPrice instanceof BigNumber ? 
          options.gasPrice : 
          options.gasPrice ? BigNumber.from(options.gasPrice.toString()) : undefined
      };

      // Process payment
      const tx = await this.contract.processPayment(
        tokenAddress,
        amount instanceof BigNumber ? amount : BigNumber.from(amount.toString()),
        session.id,
        txOptions
      );

      await tx.wait();
      return session.id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Payment failed: ${errorMessage}`);
      throw error;
    }
  }

  public async isTokenSupported(tokenAddress: string): Promise<boolean> {
    try {
      return await this.contract.isTokenSupported(tokenAddress);
    } catch (error) {
      console.error(`Error checking token support: ${error}`);
      return false;
    }
  }

  public cleanup(): void {
    this.contract.removeAllListeners();
  }
}
