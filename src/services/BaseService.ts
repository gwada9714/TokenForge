import { serviceRegistry } from "./ServiceRegistry";
import { ErrorService, NotificationService } from "../types/services";

export abstract class BaseService {
  protected errorService: ErrorService;
  protected notificationService: NotificationService;

  protected constructor() {
    this.errorService = serviceRegistry.get<ErrorService>("error");
    this.notificationService =
      serviceRegistry.get<NotificationService>("notification");
  }

  protected handleError(error: unknown, message?: string): Error {
    const handledError = this.errorService.handleError(error);
    if (message) {
      this.notificationService.error(message);
    }
    return handledError;
  }

  protected notifySuccess(message: string): void {
    this.notificationService.success(message);
  }

  protected notifyInfo(message: string): void {
    this.notificationService.info(message);
  }

  protected notifyWarning(message: string): void {
    this.notificationService.warning(message);
  }
}

export abstract class BaseSingletonService<T> {
  protected static instance: any;

  protected constructor() {}

  public static getInstance<T>(this: new () => T): T {
    if (!this.instance) {
      this.instance = new this();
    }
    return this.instance;
  }

  protected abstract initialize(): Promise<void>;
  protected abstract cleanup(): Promise<void>;
}
