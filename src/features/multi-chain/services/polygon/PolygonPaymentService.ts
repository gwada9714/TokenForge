import { ethers, BigNumber } from 'ethers';
import { PolygonPaymentContract } from './contracts/PolygonPayment';
import { PaymentSessionService } from '../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus } from '../payment/types/PaymentSession';
import { BasePaymentService, PaymentAmount, PaymentOptions } from '../payment/types/PaymentService';
import { validatePaymentParams } from '../payment/utils/paymentValidation';

export interface PolygonPaymentConfig {
  contractAddress: string;
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
  maxGasPrice?: BigNumber;
  receiverAddress: string;
}

export class PolygonPaymentService implements BasePaymentService {
  private static instance: PolygonPaymentService;
  private contract: PolygonPaymentContract;
  private sessionService: PaymentSessionService;
  private config: PolygonPaymentConfig;

  private constructor(config: PolygonPaymentConfig) {
    this.config = config;
    this.contract = new PolygonPaymentContract(config.contractAddress, config.signer);
    this.sessionService = PaymentSessionService.getInstance();
    this.setupEventListeners();
  }

  public static getInstance(config?: PolygonPaymentConfig): PolygonPaymentService {
    if (!PolygonPaymentService.instance) {
      if (!config) {
        throw new Error('Configuration required for initialization');
      }
      PolygonPaymentService.instance = new PolygonPaymentService(config);
    }
    return PolygonPaymentService.instance;
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
        PaymentNetwork.POLYGON,
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

      // Check gas price limit
      if (this.config.maxGasPrice && txOptions.gasPrice) {
        if (txOptions.gasPrice.gt(this.config.maxGasPrice)) {
          throw new Error('Gas price exceeds maximum allowed');
        }
      }

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
