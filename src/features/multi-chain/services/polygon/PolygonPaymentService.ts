import { 
  Address,
  PublicClient,
  WalletClient
} from 'viem';
import { PolygonPaymentContract } from './contracts/PolygonPayment';
import { PaymentSessionService } from '../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus, PaymentToken } from '../payment/types/PaymentSession';
import { BasePaymentService, PaymentAmount, PaymentOptions } from '../payment/types/PaymentService';
import { validatePaymentParams } from '../payment/utils/paymentValidation';

export interface PolygonPaymentConfig {
  contractAddress: Address;
  publicClient: PublicClient;
  walletClient: WalletClient;
  maxFeePerGas?: bigint;
  receiverAddress: Address;
}

export class PolygonPaymentService implements BasePaymentService {
  private static instance: PolygonPaymentService;
  private contract: PolygonPaymentContract;
  private sessionService: PaymentSessionService;

  private constructor(config: PolygonPaymentConfig) {
    this.contract = new PolygonPaymentContract(
      config.contractAddress,
      config.publicClient,
      config.walletClient
    );
    this.sessionService = PaymentSessionService.getInstance();
    this.setupEventListeners();
  }

  public static getInstance(config?: PolygonPaymentConfig): PolygonPaymentService {
    if (!PolygonPaymentService.instance && config) {
      PolygonPaymentService.instance = new PolygonPaymentService(config);
    }
    return PolygonPaymentService.instance;
  }

  private async setupEventListeners(): Promise<void> {
    await this.contract.watchPaymentReceived(
      async ({ payer: _payer, token: _token, amount: _amount, sessionId }) => {
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
        network: PaymentNetwork.POLYGON,
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

      // Get current gas price and apply max fee if configured
      const currentGasPrice = await this.contract.getGasPrice();
      const maxFeePerGas = options.maxFeePerGas || options.gasPrice || currentGasPrice;

      // Process payment and get transaction hash
      await this.contract.payWithToken(
        tokenAddress,
        amountBigInt,
        serviceType,
        session.id,
        {
          gasLimit: options.gasLimit,
          maxFeePerGas
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

  public async payWithMatic(
    amount: PaymentAmount,
    serviceType: string,
    userId: string,
    options: PaymentOptions
  ): Promise<string> {
    try {
      // Create payment token object for MATIC
      const paymentToken: PaymentToken = {
        address: '0x0000000000000000000000000000000000000000' as Address, // Zero address for native MATIC
        network: PaymentNetwork.POLYGON,
        symbol: 'MATIC',
        decimals: 18
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

      // Get current gas price and apply max fee if configured
      const currentGasPrice = await this.contract.getGasPrice();
      const maxFeePerGas = options.maxFeePerGas || options.gasPrice || currentGasPrice;

      // Process payment with native MATIC
      await this.contract.payWithMatic(
        serviceType,
        session.id,
        amountBigInt,
        {
          gasLimit: options.gasLimit,
          maxFeePerGas
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
    this.contract.cleanup();
  }
}
