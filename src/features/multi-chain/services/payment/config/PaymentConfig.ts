export const PaymentConfig = {
  session: {
    timeout: 10 * 60 * 1000, // 10 minutes
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
  },
  retry: {
    maxAttempts: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffFactor: 2,
  },
  sync: {
    interval: 30 * 1000, // 30 seconds
    batchSize: 50,
  },
  validation: {
    maxAmount: BigInt('1000000000000000000000000'), // 1M tokens
    minAmount: BigInt('100000'), // 0.1 tokens
    minGasLimit: BigInt(21000),
  },
  monitoring: {
    errorThreshold: 5,
    warningThreshold: 3,
    metricsInterval: 60 * 1000, // 1 minute
  }
} as const;

export type RetryConfig = typeof PaymentConfig.retry;
export type SessionConfig = typeof PaymentConfig.session;
export type SyncConfig = typeof PaymentConfig.sync;
export type ValidationConfig = typeof PaymentConfig.validation;
export type MonitoringConfig = typeof PaymentConfig.monitoring;
