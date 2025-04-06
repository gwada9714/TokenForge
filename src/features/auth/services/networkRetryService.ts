import { logService } from "./logService";
import { notificationService } from "./notificationService";
import type { NotificationOptions } from "./notificationService";

const LOG_CATEGORY = "NetworkRetryService";

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  timeout: number;
  metadata?: Record<string, unknown>;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
}

export class NetworkRetryService {
  private static instance: NetworkRetryService;

  private constructor() {}

  static getInstance(): NetworkRetryService {
    if (!NetworkRetryService.instance) {
      NetworkRetryService.instance = new NetworkRetryService();
    }
    return NetworkRetryService.instance;
  }

  private async handleError(
    error: unknown,
    context: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logService.error(LOG_CATEGORY, `Error during ${context}`, {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
      ...metadata,
    });
  }

  async retryWithTimeout<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    context: string
  ): Promise<RetryResult<T>> {
    let attempts = 0;

    while (attempts < config.maxAttempts) {
      attempts++;
      try {
        const result = await operation();
        if (attempts > 1) {
          notificationService.success(
            `${context} réussie après ${attempts} tentatives`,
            {
              toastId: `${context}-success-${attempts}`,
            } satisfies NotificationOptions
          );
        }
        return { success: true, result, attempts };
      } catch (error) {
        await this.handleError(error, context, config.metadata);

        if (attempts === config.maxAttempts) {
          notificationService.error(
            `${context} échouée après ${attempts} tentatives`,
            {
              toastId: `${context}-error-${attempts}`,
            } satisfies NotificationOptions
          );
          return {
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
            attempts,
          };
        }

        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempts - 1),
          config.maxDelay
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return { success: false, attempts };
  }
}

export const networkRetryService = NetworkRetryService.getInstance();
