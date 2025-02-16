import { logger } from '@/utils/logger';

export enum ServiceStatus {
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export abstract class BaseService {
  protected status: ServiceStatus = ServiceStatus.INITIALIZING;
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  abstract initialize(): Promise<void>;
  abstract cleanup(): Promise<void>;

  protected log(message: string, metadata?: Record<string, unknown>) {
    logger.info(message, {
      category: this.serviceName,
      metadata
    });
  }

  protected logError(message: string, error: Error, metadata?: Record<string, unknown>) {
    logger.error(message, error, {
      category: this.serviceName,
      metadata
    });
  }
}
