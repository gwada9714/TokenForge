import { logger } from '@/core/logger';

export class CurrencyConverter {
  private static instance: CurrencyConverter;
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  private cache: Map<string, { rate: number; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): CurrencyConverter {
    if (!CurrencyConverter.instance) {
      CurrencyConverter.instance = new CurrencyConverter();
    }
    return CurrencyConverter.instance;
  }

  async convertUSDToBNB(usdAmount: number): Promise<number> {
    try {
      const rate = await this.getBNBPrice();
      return usdAmount / rate;
    } catch (error) {
      logger.error('Erreur lors de la conversion USD/BNB', { error, usdAmount });
      throw new Error('Impossible de convertir USD en BNB');
    }
  }

  async convertBNBToUSD(bnbAmount: number): Promise<number> {
    try {
      const rate = await this.getBNBPrice();
      return bnbAmount * rate;
    } catch (error) {
      logger.error('Erreur lors de la conversion BNB/USD', { error, bnbAmount });
      throw new Error('Impossible de convertir BNB en USD');
    }
  }

  private async getBNBPrice(): Promise<number> {
    const cacheKey = 'bnb_usd';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.rate;
    }

    try {
      const response = await fetch(
        `${this.COINGECKO_API}/simple/price?ids=binancecoin&vs_currencies=usd`
      );
      
      if (!response.ok) {
        throw new Error('Erreur API CoinGecko');
      }

      const data = await response.json();
      const rate = data.binancecoin.usd;

      this.cache.set(cacheKey, {
        rate,
        timestamp: Date.now()
      });

      return rate;
    } catch (error) {
      logger.error('Erreur lors de la récupération du prix BNB', { error });
      throw new Error('Impossible de récupérer le taux de change');
    }
  }
} 