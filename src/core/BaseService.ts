import { logger } from "../core/logger";

export abstract class BaseService {
  protected readonly category: string;

  constructor(category: string) {
    this.category = category;
  }

  protected log(message: string, data?: unknown): void {
    logger.info(message, { category: this.category, data });
  }

  protected logError(message: string, error: Error): void {
    logger.error(message, {
      category: this.category,
      data: {
        error: error.message,
        stack: error.stack,
      },
    });
  }

  abstract initialize(): Promise<void>;
  abstract cleanup(): Promise<void>;
}
