declare module "@/features/multi-chain/services/payment/PaymentService" {
  export class PaymentService {
    createPaymentSession(params: {
      userId: string;
      token: PaymentToken;
      amount: string;
    }): Promise<PaymentSession>;
    processPayment(
      session: PaymentSession,
      options?: { timeout?: number }
    ): Promise<PaymentSession>;
    getPaymentStatus(sessionId: string): Promise<PaymentStatus>;
    subscribeToStatusUpdates(
      sessionId: string,
      callback: (status: PaymentStatus) => void
    ): void;
    subscribeToConfirmations(
      sessionId: string,
      callback: (count: number) => void
    ): void;
  }
}

declare module "@/features/multi-chain/services/wallet/WalletService" {
  export class WalletService {
    checkBalance(token: PaymentToken, amount: string): Promise<boolean>;
    sendTransaction(params: any): Promise<any>;
    connect(): Promise<void>;
    monitorTransaction(txHash: string): Promise<{ status: string }>;
  }
}

declare module "@/services/auth/AuthService" {
  export class AuthService {
    login(
      email: string,
      password: string,
      options?: { ip?: string; csrfToken?: string }
    ): Promise<any>;
    register(params: { email: string; password: string }): Promise<any>;
    createSession(user: {
      email: string;
      password: string;
    }): Promise<{ isActive: () => boolean }>;
    getActiveSessions(email: string): Promise<any[]>;
  }
}

declare module "@/services/auth/TokenService" {
  export class TokenService {
    generateToken(user: { email: string }): Promise<string>;
    verifyToken(token: string): Promise<boolean>;
    getTokenPayload(token: string): any;
  }
}

declare module "@/services/security/SecurityService" {
  export class SecurityService {
    resetAttempts(email: string): void;
    notifySuspiciousActivity(params: any): void;
    detectBruteForce(): boolean;
    markIPAsSuspicious(ip: string): Promise<void>;
    generateCSRFToken(): Promise<string>;
  }
}

declare module "@/services/user/UserService" {
  export class UserService {
    updatePassword(email: string, newPassword: string): Promise<void>;
  }
}

declare module "@/services/monitoring/PerformanceMonitor" {
  export class PerformanceMonitor {
    startMetrics(): any;
    endMetrics(metrics: any): {
      totalTime: number;
      averageResponseTime: number;
      maxResponseTime: number;
      minResponseTime: number;
      throughput: number;
    };
    measureBaseline(): Promise<{ averageResponseTime: number }>;
    measureUnderLoad(factor: number): Promise<{ averageResponseTime: number }>;
    trackMemoryUsage(
      fn: () => Promise<void>
    ): Promise<{ peak: number; leaked: number }>;
    trackConnections(
      fn: () => Promise<void>
    ): Promise<{ peak: number; leaked: number }>;
  }
}

declare module "@/services/notification/NotificationService" {
  export class NotificationService {
    getNotifications(userId: string): Array<{
      type: string;
      message: string;
    }>;
  }
}

declare module "@/types/errors" {
  export class AuthError extends Error {
    constructor(message: string);
  }
}
