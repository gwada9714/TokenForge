export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  public register<T>(name: string, service: T): void {
    if (this.services.has(name)) {
      console.warn(`Service ${name} is already registered. It will be overwritten.`);
    }
    this.services.set(name, service);
  }

  public get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found in registry`);
    }
    return service as T;
  }

  public clear(): void {
    this.services.clear();
  }
}

export const serviceRegistry = ServiceRegistry.getInstance();
