import { PaymentSession, PaymentStatus, PaymentNetwork } from './types/PaymentSession';

export class PaymentSessionService {
  private static instance: PaymentSessionService;

  private constructor() {}

  public static getInstance(): PaymentSessionService {
    if (!PaymentSessionService.instance) {
      PaymentSessionService.instance = new PaymentSessionService();
    }
    return PaymentSessionService.instance;
  }

  public async createSession(params: {
    userId: string;
    amount: bigint;
    network: PaymentNetwork;
    serviceType: string;
  }): Promise<PaymentSession> {
    return {
      id: 'test-session-id',
      userId: params.userId,
      amount: params.amount,
      network: params.network,
      serviceType: params.serviceType,
      status: PaymentStatus.PROCESSING,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000),
      retryCount: 0,
      options: {}
    };
  }

  public async updateSessionStatus(
    _sessionId: string,
    _status: PaymentStatus,
    _transactionHash?: string,
    _error?: string
  ): Promise<void> {
    // Dans un environnement de test, nous ne faisons rien
  }
}
