import { ethers } from 'ethers';
import { PolygonPaymentContract, PaymentReceivedEvent } from './contracts/PolygonPayment';
import { PaymentSessionService } from '../payment/PaymentSessionService';
import { PaymentNetwork, PaymentStatus, PaymentToken } from '../payment/types/PaymentSession';

export interface PolygonPaymentConfig {
  contractAddress: string;
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
  receiverAddress: string;
  maxGasPrice?: ethers.BigNumber; // Optional max gas price in wei
}

export class PolygonPaymentService {
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

  private async checkGasPrice(): Promise<void> {
    if (this.config.maxGasPrice) {
      const currentGasPrice = await this.contract.getGasPrice();
      if (currentGasPrice.gt(this.config.maxGasPrice)) {
        throw new Error('Gas price too high');
      }
    }
  }

  public async payWithMatic(
    amount: ethers.BigNumber,
    serviceType: string,
    userId: string
  ): Promise<string> {
    try {
      await this.checkGasPrice();

      // Create payment session
      const session = this.sessionService.createSession(
        userId,
        amount,
        {
          symbol: 'MATIC',
          address: ethers.constants.AddressZero,
          decimals: 18,
          network: PaymentNetwork.POLYGON
        },
        serviceType as any
      );

      // Send transaction
      const tx = await this.contract.payWithMatic(
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
      throw new Error(`Failed to process MATIC payment: ${errorMessage}`);
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
      await this.checkGasPrice();

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
