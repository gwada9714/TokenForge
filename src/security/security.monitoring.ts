import { createPublicClient, http, type PublicClient, type Hash } from "viem";
import { mainnet } from "viem/chains";
import { chainPolicies } from "./security.policies";

interface SecurityAlert {
  type: "transaction" | "event" | "error";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: number;
  data?: unknown;
}

class SecurityMonitoring {
  private client: PublicClient;
  private alerts: SecurityAlert[] = [];
  private readonly MAX_ALERTS = 1000;

  constructor() {
    this.client = createPublicClient({
      chain: chainPolicies.defaultChain,
      transport: http(),
      batch: {
        multicall: true,
        size: chainPolicies.rpcConfig.batchSize,
      },
    });
  }

  async monitorTransaction(hash: Hash) {
    try {
      const receipt = await this.client.waitForTransactionReceipt({
        hash,
        confirmations: chainPolicies.transactionPolicies.minConfirmations,
        timeout: chainPolicies.rpcConfig.timeout,
      });

      if (receipt.gasUsed > chainPolicies.transactionPolicies.maxGasLimit) {
        this.addAlert({
          type: "transaction",
          severity: "high",
          message: `High gas usage detected in transaction ${hash}`,
          timestamp: Date.now(),
          data: { gasUsed: receipt.gasUsed, receipt },
        });
      }

      return receipt;
    } catch (error) {
      this.addAlert({
        type: "error",
        severity: "medium",
        message: `Transaction monitoring failed for ${hash}`,
        timestamp: Date.now(),
        data: { error },
      });
      throw error;
    }
  }

  async watchPendingTransactions(address: string) {
    return this.client.watchPendingTransactions({
      onTransactionSent: (hash) => {
        this.addAlert({
          type: "transaction",
          severity: "low",
          message: `New pending transaction detected for ${address}`,
          timestamp: Date.now(),
          data: { hash },
        });
      },
      poll: true,
    });
  }

  private addAlert(alert: SecurityAlert) {
    this.alerts.unshift(alert);
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts.pop();
    }

    // TODO: Implement real-time notification system
    console.log("Security Alert:", alert);
  }

  getRecentAlerts(count = 10): SecurityAlert[] {
    return this.alerts.slice(0, count);
  }

  async validateChainId(chainId: number): Promise<boolean> {
    const allowedChainIds = chainPolicies.allowedChains.map(
      (chain) => chain.id
    );
    if (!allowedChainIds.includes(chainId)) {
      this.addAlert({
        type: "error",
        severity: "critical",
        message: `Unsupported chain ID detected: ${chainId}`,
        timestamp: Date.now(),
        data: { chainId, allowedChainIds },
      });
      return false;
    }
    return true;
  }
}

export const securityMonitoring = new SecurityMonitoring();
