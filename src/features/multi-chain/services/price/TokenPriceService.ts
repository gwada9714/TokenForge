import { PaymentNetwork } from '../payment/types/PaymentSession';

interface TokenPriceMap {
  [symbol: string]: number;
}

const COINGECKO_IDS: Record<string, string> = {
  ETH: 'ethereum',
  USDT: 'tether',
  USDC: 'usd-coin',
  DAI: 'dai',
  BNB: 'binancecoin',
  BUSD: 'binance-usd',
  MATIC: 'matic-network',
  SOL: 'solana',
};

export class TokenPriceService {
  private static instance: TokenPriceService;
  private prices: Map<PaymentNetwork, TokenPriceMap>;
  private updateInterval: NodeJS.Timeout | null;
  private readonly UPDATE_INTERVAL_MS = 60000; // 1 minute

  private constructor() {
    this.prices = new Map();
    this.updateInterval = null;
    this.startPriceUpdates();
  }

  public static getInstance(): TokenPriceService {
    if (!TokenPriceService.instance) {
      TokenPriceService.instance = new TokenPriceService();
    }
    return TokenPriceService.instance;
  }

  private async fetchPrices(): Promise<void> {
    try {
      const ids = Object.values(COINGECKO_IDS).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await response.json();
      
      // Mettre à jour les prix pour chaque réseau
      Object.entries(COINGECKO_IDS).forEach(([symbol, id]) => {
        const price = data[id]?.usd;
        if (price) {
          // Pour les stablecoins, utiliser 1 USD
          const finalPrice = ['USDT', 'USDC', 'DAI', 'BUSD'].includes(symbol) ? 1 : price;
          
          // Mettre à jour le prix pour chaque réseau où ce token existe
          Object.values(PaymentNetwork).forEach(network => {
            const networkPrices = this.prices.get(network) || {};
            if (this.isTokenSupportedOnNetwork(symbol, network)) {
              networkPrices[symbol] = finalPrice;
              this.prices.set(network, networkPrices);
            }
          });
        }
      });

      this.notifyPriceUpdates();
    } catch (error) {
      console.error('Error fetching token prices:', error);
    }
  }

  private isTokenSupportedOnNetwork(symbol: string, network: PaymentNetwork): boolean {
    switch (network) {
      case PaymentNetwork.ETHEREUM:
        return ['ETH', 'USDT', 'USDC', 'DAI'].includes(symbol);
      case PaymentNetwork.BINANCE:
        return ['BNB', 'BUSD', 'USDT', 'USDC'].includes(symbol);
      case PaymentNetwork.POLYGON:
        return ['MATIC', 'USDT', 'USDC', 'DAI'].includes(symbol);
      case PaymentNetwork.SOLANA:
        return ['SOL', 'USDC', 'USDT'].includes(symbol);
      default:
        return false;
    }
  }

  private startPriceUpdates(): void {
    // Fetch initial prices
    this.fetchPrices();
    
    // Set up interval for price updates
    this.updateInterval = setInterval(() => {
      this.fetchPrices();
    }, this.UPDATE_INTERVAL_MS);
  }

  public getPrices(network: PaymentNetwork): TokenPriceMap {
    return this.prices.get(network) || {};
  }

  private listeners: Set<(prices: Map<PaymentNetwork, TokenPriceMap>) => void> = new Set();

  public onPriceUpdate(callback: (prices: Map<PaymentNetwork, TokenPriceMap>) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyPriceUpdates(): void {
    this.listeners.forEach(callback => callback(this.prices));
  }

  public cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.listeners.clear();
    this.prices.clear();
  }
} 