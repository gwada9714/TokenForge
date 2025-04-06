import { PaymentStatus } from "../types/PaymentSession";

export interface SessionService {
  createSession(params: {
    userId: string;
    amount: bigint;
    network: string;
    serviceType: string;
  }): Promise<{ id: string; status: PaymentStatus }>;

  updateSessionStatus(
    sessionId: string,
    status: PaymentStatus,
    transactionHash?: string,
    error?: string
  ): Promise<void>;
}
