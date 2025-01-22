import { 
  Address,
  PublicClient,
  WalletClient
} from 'viem';
import { EthereumPaymentContract } from './contracts/EthereumPayment';
import { PaymentSessionService } from '../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus, PaymentToken } from '../payment/types/PaymentSession';
import { BasePaymentService, PaymentAmount, PaymentOptions } from '../payment/types/PaymentService';
import { validatePaymentParams } from '../payment/utils/paymentValidation';

export interface EthereumPaymentConfig {
  contractAddress: Address;
  publicClient: PublicClient;
  walletClient: WalletClient;
  receiverAddress: Address;
}

export class EthereumPaymentService implements BasePaymentService {
  private static instance: EthereumPaymentService;
  private contract: EthereumPaymentContract;
  private sessionService: PaymentSessionService;
  private config: EthereumPaymentConfig;

  private constructor(config: EthereumPaymentConfig) {
    this.config = config;
    this.contract = new EthereumPaymentContract(
      config.contractAddress,
      config.publicClient,
      config.walletClient
    );
    this.sessionService = PaymentSessionService.getInstance();
    this.setupEventListeners();
  }

  public static getInstance(config?: EthereumPaymentConfig): EthereumPaymentService {
    if (!EthereumPaymentService.instance && config) {
      EthereumPaymentService.instance = new EthereumPaymentService(config);
    }
    return EthereumPaymentService.instance;
  }

  private async setupEventListeners(): Promise<void> {
    await this.contract.watchPaymentProcessed(
      async (_payer: Address, _amount: bigint, sessionId: string) => {
        try {
          await this.sessionService.updateSessionStatus(
            sessionId,
            PaymentStatus.CONFIRMED
          );
        } catch (error) {
          console.error('Failed to update session status:', error);
        }
      }
    );
  }

  public async payWithToken(
    tokenAddress: Address,
    amount: PaymentAmount,
    serviceType: string,
    userId: string,
    options: PaymentOptions
  ): Promise<string> {
    try {
      // Validate parameters
      validatePaymentParams(tokenAddress, amount, userId);

      // Create payment token object
      const paymentToken: PaymentToken = {
        address: tokenAddress,
        network: PaymentNetwork.ETHEREUM,
        symbol: '', // This should be fetched from token contract
        decimals: 18 // This should be fetched from token contract
      };

      // Create payment session
      const amountBigInt = BigInt(amount.toString());
      const session = this.sessionService.createSession(
        userId,
        amountBigInt,
        paymentToken,
        serviceType
      );

      if (!session) {
        throw new Error('Failed to create payment session');
      }

      // Process payment and get transaction hash
      const tx = await this.contract.processPayment(
        tokenAddress,
        amountBigInt,
        session.id,
        {
          gasLimit: options.gasLimit
        }
      );

      // Update session status to processing
      await this.sessionService.updateSessionStatus(
        session.id,
        PaymentStatus.PROCESSING
      );

      return session.id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Payment failed: ${errorMessage}`);
    }
  }

  public async isTokenSupported(tokenAddress: Address): Promise<boolean> {
    try {
      return await this.contract.isTokenSupported(tokenAddress);
    } catch {
      return false;
    }
  }

  public cleanup(): void {
    this.contract.removeAllListeners();
  }
}
