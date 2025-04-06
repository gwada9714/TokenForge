import { Address, PublicClient, WalletClient } from "viem";
import { PaymentSessionService } from "./PaymentSessionService";
import { PaymentNetwork, PaymentStatus } from "./types/PaymentSession";
import { EVMTokenConfig } from "./types/TokenConfig";
import { ERC20_ABI, PAYMENT_CONTRACT_ABI } from "./abis/TokenABI";
import { getNetworkConfig, getTokenConfig } from "./config/SupportedTokens";

export interface EVMPaymentConfig {
  contractAddress: Address;
  receiverAddress: Address;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

export interface EVMPaymentOptions {
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
}

export abstract class BaseEVMPaymentService {
  protected readonly sessionService: PaymentSessionService;
  protected readonly config: EVMPaymentConfig;
  protected cleanupFunctions: Array<() => void> = [];

  constructor(config: EVMPaymentConfig) {
    this.config = config;
    this.sessionService = PaymentSessionService.getInstance();
  }

  public abstract getNetwork(): PaymentNetwork;

  public async isTokenSupported(tokenAddress: Address): Promise<boolean> {
    try {
      const result = await this.config.publicClient.readContract({
        address: this.config.contractAddress,
        abi: PAYMENT_CONTRACT_ABI,
        functionName: "isTokenSupported",
        args: [tokenAddress],
      });
      return result;
    } catch (error) {
      console.error("Error checking token support:", error);
      return false;
    }
  }

  public async payWithToken(
    tokenAddress: Address,
    amount: bigint,
    serviceType: string,
    sessionId: string,
    options: EVMPaymentOptions = {}
  ): Promise<void> {
    const networkConfig = getNetworkConfig(this.getNetwork());
    const tokenConfig = getTokenConfig(
      this.getNetwork(),
      tokenAddress
    ) as EVMTokenConfig;

    // Vérifier si le token est supporté
    if (!(await this.isTokenSupported(tokenAddress))) {
      throw new Error(
        `Token ${tokenAddress} not supported on ${networkConfig.network}`
      );
    }

    try {
      // Mettre à jour le statut en PROCESSING avec le type de service
      this.sessionService.updateSessionStatus(
        sessionId,
        PaymentStatus.PROCESSING,
        undefined,
        `Processing ${serviceType} payment`
      );

      if (tokenConfig.type === "NATIVE") {
        await this.payWithNativeToken(amount, sessionId, options);
      } else {
        await this.payWithERC20Token(tokenAddress, amount, sessionId, options);
      }
    } catch (error) {
      this.sessionService.updateSessionStatus(
        sessionId,
        PaymentStatus.FAILED,
        undefined,
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      throw error;
    }
  }

  protected async payWithNativeToken(
    amount: bigint,
    sessionId: string,
    options: EVMPaymentOptions
  ): Promise<void> {
    const { request } = await this.config.publicClient.simulateContract({
      address: this.config.contractAddress,
      abi: PAYMENT_CONTRACT_ABI,
      functionName: "payWithNativeToken",
      args: [sessionId],
      value: amount,
      account: this.config.walletClient.account,
      ...options,
    });

    await this.config.walletClient.writeContract(request);
  }

  protected async payWithERC20Token(
    tokenAddress: Address,
    amount: bigint,
    sessionId: string,
    options: EVMPaymentOptions
  ): Promise<void> {
    // 1. Approuver le contrat de paiement
    const { request: approveRequest } =
      await this.config.publicClient.simulateContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [this.config.contractAddress, amount],
        account: this.config.walletClient.account,
        ...options,
      });

    await this.config.walletClient.writeContract(approveRequest);

    // 2. Effectuer le paiement
    const { request: paymentRequest } =
      await this.config.publicClient.simulateContract({
        address: this.config.contractAddress,
        abi: PAYMENT_CONTRACT_ABI,
        functionName: "payWithToken",
        args: [tokenAddress, amount, sessionId],
        account: this.config.walletClient.account,
        ...options,
      });

    await this.config.walletClient.writeContract(paymentRequest);
  }

  protected setupEventListeners(): void {
    const unwatch = this.config.publicClient.watchContractEvent({
      address: this.config.contractAddress,
      abi: PAYMENT_CONTRACT_ABI,
      eventName: "PaymentReceived",
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

  public cleanup(): void {
    this.cleanupFunctions.forEach((cleanup) => cleanup());
    this.cleanupFunctions = [];
  }
}
