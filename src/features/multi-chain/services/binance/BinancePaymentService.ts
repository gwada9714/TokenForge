import { ethers } from 'ethers';
import { BinancePaymentContract, PaymentReceivedEvent } from './contracts/BinancePayment';
import { PaymentSessionService } from '../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus, PaymentToken } from '../payment/types/PaymentSession';

export interface BinancePaymentConfig {
  contractAddress: string;
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
  receiverAddress: string;
}

export class BinancePaymentService {
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
    this.contract.onPaymentReceived(this.handlePaymentReceived.bind(this));
  }

  private async handlePaymentReceived(event: PaymentReceivedEvent): Promise<void> {
    try {
      this.sessionService.updateSessionStatus(
        event.sessionId,
        PaymentStatus.CONFIRMED,
        event.payer
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Error handling payment received event: ${errorMessage}`);
    }
  }

  public async payWithBNB(
    amount: ethers.BigNumber,
    serviceType: string,
    userId: string
  ): Promise<string> {
    try {
      // Create payment session
      const session = this.sessionService.createSession(
        userId,
        amount,
        {
          symbol: 'BNB',
          address: ethers.constants.AddressZero,
          decimals: 18,
          network: PaymentNetwork.BINANCE
        },
        serviceType as any
      );

      // Send transaction
      const tx = await this.contract.payWithBNB(
        amount,
        serviceType,
        session.id
      );

      // Update session with pending transaction
      this.sessionService.updateSessionStatus(
        session.id,
        PaymentStatus.PROCESSING,
        tx.hash
      );

      return session.id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to process BNB payment: ${errorMessage}`);
    }
  }

  public async payWithToken(
    tokenAddress: string,
    amount: ethers.BigNumber,
    serviceType: string,
    userId: string,
    token: PaymentToken
  ): Promise<string> {
    try {
      // Verify token is supported
      const isSupported = await this.contract.isTokenSupported(tokenAddress);
      if (!isSupported) {
        throw new Error('Token not supported');
      }

      // Create payment session
      const session = this.sessionService.createSession(
        userId,
        amount,
        token,
        serviceType as any
      );

      // Approve token spending
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        this.config.signer
      );

      const approveTx = await tokenContract.approve(
        this.config.contractAddress,
        amount
      );
      await approveTx.wait();

      // Send payment transaction
      const tx = await this.contract.payWithToken(
        tokenAddress,
        amount,
        serviceType,
        session.id
      );

      // Update session with pending transaction
      this.sessionService.updateSessionStatus(
        session.id,
        PaymentStatus.PROCESSING,
        tx.hash
      );

      return session.id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to process token payment: ${errorMessage}`);
    }
  }

  public async getTokenAllowance(
    tokenAddress: string,
    ownerAddress: string
  ): Promise<ethers.BigNumber> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function allowance(address owner, address spender) view returns (uint256)'],
      this.config.provider
    );

    return tokenContract.allowance(ownerAddress, this.config.contractAddress);
  }

  public async isTokenSupported(tokenAddress: string): Promise<boolean> {
    return this.contract.isTokenSupported(tokenAddress);
  }

  public getReceiverAddress(): Promise<string> {
    return this.contract.getReceiverAddress();
  }

  public cleanup(): void {
    this.contract.removeAllListeners();
  }
}
