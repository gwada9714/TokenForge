import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { TokenPriceService } from '../TokenPriceService';
import { PaymentNetwork } from '../../payment/types/PaymentSession';

describe('TokenPriceService', () => {
  let service: TokenPriceService;
  
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn();
    service = TokenPriceService.getInstance();
  });

  afterEach(() => {
    service.cleanup();
    vi.restoreAllMocks();
  });

  it('should fetch and update prices correctly', async () => {
    const mockPrices = {
      'ethereum': { usd: 2000 },
      'tether': { usd: 1 },
      'binancecoin': { usd: 300 },
      'solana': { usd: 50 },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrices,
    });

    // Trigger a price update manually (private method, we need to access it)
    await (service as any).fetchPrices();

    // Check Ethereum network prices
    const ethPrices = service.getPrices(PaymentNetwork.ETHEREUM);
    expect(ethPrices.ETH).toBe(2000);
    expect(ethPrices.USDT).toBe(1);

    // Check Binance network prices
    const bnbPrices = service.getPrices(PaymentNetwork.BINANCE);
    expect(bnbPrices.BNB).toBe(300);
    expect(bnbPrices.USDT).toBe(1);

    // Check Solana network prices
    const solPrices = service.getPrices(PaymentNetwork.SOLANA);
    expect(solPrices.SOL).toBe(50);
    expect(solPrices.USDT).toBe(1);
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    // Trigger a price update
    await (service as any).fetchPrices();

    // Should return empty prices on error
    const prices = service.getPrices(PaymentNetwork.ETHEREUM);
    expect(prices).toEqual({});
  });

  it('should notify listeners of price updates', async () => {
    const mockPrices = {
      'ethereum': { usd: 2000 },
      'tether': { usd: 1 },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrices,
    });

    let notified = false;
    const unsubscribe = service.onPriceUpdate((prices) => {
      const ethPrices = prices.get(PaymentNetwork.ETHEREUM);
      expect(ethPrices?.ETH).toBe(2000);
      notified = true;
    });

    await (service as any).fetchPrices();
    expect(notified).toBe(true);

    unsubscribe();
  });

  it('should handle stablecoins correctly', async () => {
    const mockPrices = {
      'tether': { usd: 1.001 }, // Slight variation
      'usd-coin': { usd: 0.999 }, // Slight variation
      'dai': { usd: 1.002 }, // Slight variation
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrices,
    });

    await (service as any).fetchPrices();

    const ethPrices = service.getPrices(PaymentNetwork.ETHEREUM);
    expect(ethPrices.USDT).toBe(1);
    expect(ethPrices.USDC).toBe(1);
    expect(ethPrices.DAI).toBe(1);
  });

  it('should cleanup properly', () => {
    const interval = setInterval(() => {}, 1000);
    (service as any).updateInterval = interval;

    service.cleanup();

    expect((service as any).updateInterval).toBeNull();
    expect((service as any).prices.size).toBe(0);
    expect((service as any).listeners.size).toBe(0);
  });
}); 