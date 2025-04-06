import { PaymentErrorType, PaymentError } from "../types/PaymentError";
import { PaymentSession } from "../types/PaymentSession";
import { PaymentConfig } from "../config/PaymentConfig";

interface PaymentMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageProcessingTime: number;
  errorsByType: Record<PaymentErrorType, number>;
  activeSessionsCount: number;
}

export class PaymentMonitor {
  private static instance: PaymentMonitor;
  private metrics!: PaymentMetrics;
  private errorCounts: Map<string, number>;
  private processingTimes: number[];
  private metricsInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.errorCounts = new Map();
    this.processingTimes = [];
    this.resetMetrics();
    this.startMetricsCollection();
  }

  public static getInstance(): PaymentMonitor {
    if (!PaymentMonitor.instance) {
      PaymentMonitor.instance = new PaymentMonitor();
    }
    return PaymentMonitor.instance;
  }

  private resetMetrics(): void {
    this.metrics = {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      averageProcessingTime: 0,
      errorsByType: Object.values(PaymentErrorType).reduce(
        (acc, type) => ({ ...acc, [type]: 0 }),
        {} as Record<PaymentErrorType, number>
      ),
      activeSessionsCount: 0,
    };
  }

  private startMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, PaymentConfig.monitoring.metricsInterval);
  }

  private collectMetrics(): void {
    // Calculate average processing time
    if (this.processingTimes.length > 0) {
      this.metrics.averageProcessingTime =
        this.processingTimes.reduce((a, b) => a + b, 0) /
        this.processingTimes.length;
    }

    // Check error thresholds
    this.errorCounts.forEach((count, sessionId) => {
      if (count >= PaymentConfig.monitoring.errorThreshold) {
        console.error(`Session ${sessionId} has exceeded error threshold`);
        // TODO: Implement alert system
      } else if (count >= PaymentConfig.monitoring.warningThreshold) {
        console.warn(`Session ${sessionId} is approaching error threshold`);
      }
    });

    // Reset processing times for next interval
    this.processingTimes = [];
  }

  public trackTransaction(session: PaymentSession, startTime: number): void {
    this.metrics.totalTransactions++;
    this.processingTimes.push(Date.now() - startTime);

    if (session.status === "CONFIRMED") {
      this.metrics.successfulTransactions++;
    } else if (session.status === "FAILED") {
      this.metrics.failedTransactions++;
    }
  }

  public trackError(sessionId: string, error: PaymentError): void {
    const currentCount = this.errorCounts.get(sessionId) || 0;
    this.errorCounts.set(sessionId, currentCount + 1);
    this.metrics.errorsByType[error.type]++;
  }

  public updateActiveSessions(count: number): void {
    this.metrics.activeSessionsCount = count;
  }

  public getMetrics(): PaymentMetrics {
    return { ...this.metrics };
  }

  public cleanup(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    this.resetMetrics();
    this.errorCounts.clear();
    this.processingTimes = [];
  }
}
