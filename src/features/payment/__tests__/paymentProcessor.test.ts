import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentProcessor, BlockchainNetwork } from '../services/paymentProcessor';

describe('PaymentProcessor', () => {
  let processor: PaymentProcessor;

  beforeEach(() => {
    processor = new PaymentProcessor();
  });

  describe('processLaunchpadFee', () => {
    it('should calculate correct fee for Ethereum', async () => {
      const amount = BigInt(1000);
      const fee = await processor.processLaunchpadFee(amount, 'ethereum');
      expect(fee).toBe(BigInt(30)); // 3% of 1000
    });

    it('should calculate correct fee for BSC', async () => {
      const amount = BigInt(1000);
      const fee = await processor.processLaunchpadFee(amount, 'bsc');
      expect(fee).toBe(BigInt(20)); // 2% of 1000
    });
  });

  describe('processStakingFee', () => {
    it('should calculate correct fee for Ethereum', async () => {
      const amount = BigInt(1000);
      const fee = await processor.processStakingFee(amount, 'ethereum');
      expect(fee).toBe(BigInt(50)); // 5% of 1000
    });

    it('should calculate correct fee for Solana', async () => {
      const amount = BigInt(1000);
      const fee = await processor.processStakingFee(amount, 'solana');
      expect(fee).toBe(BigInt(30)); // 3% of 1000
    });
  });
});
