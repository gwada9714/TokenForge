import { describe, expect, it } from 'vitest';
import { PaymentNetwork, PaymentStatus, PaymentToken, PaymentSession } from '../types/PaymentSession';
import { Address } from 'viem';

describe('PaymentSession Types', () => {
  it('should create a valid PaymentToken', () => {
    const token: PaymentToken = {
      address: '0x1234567890123456789012345678901234567890' as Address,
      network: PaymentNetwork.ETHEREUM,
      symbol: 'ETH',
      decimals: 18
    };

    expect(token.network).toBe(PaymentNetwork.ETHEREUM);
    expect(token.symbol).toBe('ETH');
    expect(token.decimals).toBe(18);
  });

  it('should create a valid PaymentSession', () => {
    const token: PaymentToken = {
      address: '0x1234567890123456789012345678901234567890' as Address,
      network: PaymentNetwork.ETHEREUM,
      symbol: 'ETH',
      decimals: 18
    };

    const session: PaymentSession = {
      id: 'test-session-id',
      userId: 'test-user-id',
      status: PaymentStatus.PENDING,
      network: PaymentNetwork.ETHEREUM,
      token,
      amount: BigInt(1000000000000000000), // 1 ETH
      serviceType: 'TEST_SERVICE',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000), // +1 hour
      retryCount: 0
    };

    expect(session.id).toBe('test-session-id');
    expect(session.status).toBe(PaymentStatus.PENDING);
    expect(session.network).toBe(PaymentNetwork.ETHEREUM);
    expect(session.token).toBe(token);
    expect(session.amount).toBe(BigInt(1000000000000000000));
    expect(session.retryCount).toBe(0);
  });

  it('should handle all payment statuses', () => {
    const statuses = Object.values(PaymentStatus);
    expect(statuses).toContain(PaymentStatus.PENDING);
    expect(statuses).toContain(PaymentStatus.PROCESSING);
    expect(statuses).toContain(PaymentStatus.CONFIRMED);
    expect(statuses).toContain(PaymentStatus.FAILED);
    expect(statuses).toContain(PaymentStatus.EXPIRED);
    expect(statuses).toContain(PaymentStatus.TIMEOUT);
  });

  it('should support all payment networks', () => {
    const networks = Object.values(PaymentNetwork);
    expect(networks).toContain(PaymentNetwork.ETHEREUM);
    expect(networks).toContain(PaymentNetwork.BINANCE);
    expect(networks).toContain(PaymentNetwork.POLYGON);
    expect(networks).toContain(PaymentNetwork.SOLANA);
  });
});
