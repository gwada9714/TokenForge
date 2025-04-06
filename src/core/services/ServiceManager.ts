import { logger } from "../logger/Logger";
import { BaseService, ServiceStatus } from "./BaseService";

export class ServiceManager {
  private static instance: ServiceManager;
  private services = new Map<string, BaseService>();
  private initialized = false;

  private constructor() {}

  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  async registerService(service: BaseService): Promise<void> {
    const serviceName = service.constructor.name;

    if (this.services.has(serviceName)) {
      return;
    }

    try {
      await service.initialize();
      this.services.set(serviceName, service);

      logger.info({
        category: "ServiceManager",
        message: `Service ${serviceName} registered`,
      });
    } catch (error) {
      logger.error({
        category: "ServiceManager",
        message: `Failed to register service ${serviceName}`,
        error: error as Error,
      });
      throw error;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      logger.info({
        category: "ServiceManager",
        message: "Initializing services",
      });

      for (const [name, service] of this.services) {
        await service.initialize();
      }

      this.initialized = true;
    } catch (error) {
      logger.error({
        category: "ServiceManager",
        message: "Service initialization failed",
        error: error as Error,
      });
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    for (const [name, service] of this.services) {
      await service.cleanup();
      logger.info(`Cleaned up service: ${name}`, {
        category: "ServiceManager",
      });
    }
    this.services.clear();
    this.initialized = false;
  }
}

export const serviceManager = ServiceManager.getInstance();
