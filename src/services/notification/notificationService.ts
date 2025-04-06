import { toast, ToastOptions } from "react-hot-toast";

interface NotificationOptions extends ToastOptions {
  autoClose?: number;
  hideProgressBar?: boolean;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  success(message: string, options?: NotificationOptions): void {
    toast.success(message, {
      duration: options?.autoClose || 3000,
      ...options,
    });
  }

  error(message: string, options?: NotificationOptions): void {
    toast.error(message, {
      duration: options?.autoClose || 5000,
      ...options,
    });
  }

  warning(message: string, options?: NotificationOptions): void {
    toast(message, {
      duration: options?.autoClose || 4000,
      icon: "⚠️",
      ...options,
    });
  }

  info(message: string, options?: NotificationOptions): void {
    toast(message, {
      duration: options?.autoClose || 3000,
      icon: "ℹ️",
      ...options,
    });
  }
}

export const notificationService = NotificationService.getInstance();
