import axios from 'axios';

/**
 * Service pour obtenir les taux de change entre crypto et monnaies fiat
 * Utilise l'API CoinGecko pour obtenir des prix en temps réel
 */
export class PriceOracleService {
  // Cache pour les prix avec timestamp
  private priceCache: Record<string, { price: number, timestamp: number }> = {};
  
  // Durée de validité du cache en millisecondes (5 minutes)
  private cacheDuration = 5 * 60 * 1000;
  
  // Mapping des symboles vers les IDs CoinGecko
  private symbolToId: Record<string, string> = {
    'ETH': 'ethereum',
    'BTC': 'bitcoin',
    'BNB': 'binancecoin',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'SOL': 'solana',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'DAI': 'dai',
    'BUSD': 'binance-usd'
  };
  
  /**
   * Obtient le prix actuel d'une cryptomonnaie dans la devise spécifiée
   * @param cryptoSymbol Symbole de la crypto (ETH, BTC, etc.)
   * @param fiatCurrency Devise cible (EUR, USD, etc.)
   * @returns Le prix de la crypto dans la devise spécifiée
   */
  async getCryptoPrice(cryptoSymbol: string, fiatCurrency: string): Promise<number> {
    const cacheKey = `${cryptoSymbol}-${fiatCurrency}`;
    
    // Vérifier si le prix est en cache et encore valide
    const cachedData = this.priceCache[cacheKey];
    if (cachedData && Date.now() - cachedData.timestamp < this.cacheDuration) {
      return cachedData.price;
    }
    
    try {
      // Cas spécial pour EUR/USD
      if (cryptoSymbol === 'EUR' && fiatCurrency === 'USD') {
        return await this.getEURUSDRate();
      }
      
      // Obtenir l'ID CoinGecko pour le symbole
      const coinId = this.getCoingeckoId(cryptoSymbol);
      
      // Appel à l'API CoinGecko
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${fiatCurrency.toLowerCase()}`
      );
      
      // Vérifier que la réponse contient les données attendues
      if (!response.data || !response.data[coinId] || !response.data[coinId][fiatCurrency.toLowerCase()]) {
        throw new Error(`Invalid response from CoinGecko for ${cryptoSymbol}/${fiatCurrency}`);
      }
      
      // Extraire le prix
      const price = response.data[coinId][fiatCurrency.toLowerCase()];
      
      // Mettre en cache
      this.priceCache[cacheKey] = {
        price,
        timestamp: Date.now()
      };
      
      return price;
    } catch (error) {
      console.error('Error fetching crypto price:', error);
      
      // En cas d'erreur, utiliser des valeurs de secours
      const fallbackPrices: Record<string, number> = {
        'ETH': 2500,
        'BNB': 350,
        'MATIC': 0.75,
        'AVAX': 30,
        'SOL': 100,
        'USDT': 0.92,
        'USDC': 0.92,
        'DAI': 0.92,
        'BUSD': 0.92
      };
      
      // Retourner la valeur de secours ou 1 par défaut
      return fallbackPrices[cryptoSymbol] || 1;
    }
  }
  
  /**
   * Obtient le taux de change EUR/USD
   * @returns Le taux EUR/USD actuel
   */
  async getEURUSDRate(): Promise<number> {
    const cacheKey = 'EUR-USD';
    
    // Vérifier si le taux est en cache et encore valide
    const cachedData = this.priceCache[cacheKey];
    if (cachedData && Date.now() - cachedData.timestamp < this.cacheDuration) {
      return cachedData.price;
    }
    
    try {
      // Utiliser une API de taux de change
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
      
      // Vérifier que la réponse contient les données attendues
      if (!response.data || !response.data.rates || !response.data.rates.USD) {
        throw new Error('Invalid response from exchange rate API');
      }
      
      // Extraire le taux
      const rate = response.data.rates.USD;
      
      // Mettre en cache
      this.priceCache[cacheKey] = {
        price: rate,
        timestamp: Date.now()
      };
      
      return rate;
    } catch (error) {
      console.error('Error fetching EUR/USD rate:', error);
      
      // Valeur par défaut en cas d'erreur
      return 1.08;
    }
  }
  
  /**
   * Convertit un montant de EUR vers une crypto spécifiée
   * @param amountEUR Montant en EUR
   * @param cryptoSymbol Symbole de la crypto
   * @returns Montant équivalent en crypto
   */
  async convertEURToCrypto(amountEUR: number, cryptoSymbol: string): Promise<number> {
    // Obtenir le taux de change
    const cryptoPrice = await this.getCryptoPrice(cryptoSymbol, 'EUR');
    
    // Calculer le montant en crypto
    return amountEUR / cryptoPrice;
  }
  
  /**
   * Convertit un montant de crypto vers EUR
   * @param amountCrypto Montant en crypto
   * @param cryptoSymbol Symbole de la crypto
   * @returns Montant équivalent en EUR
   */
  async convertCryptoToEUR(amountCrypto: number, cryptoSymbol: string): Promise<number> {
    // Obtenir le taux de change
    const cryptoPrice = await this.getCryptoPrice(cryptoSymbol, 'EUR');
    
    // Calculer le montant en EUR
    return amountCrypto * cryptoPrice;
  }
  
  /**
   * Convertit le symbole en ID CoinGecko
   * @param symbol Symbole de la crypto
   * @returns ID CoinGecko correspondant
   */
  private getCoingeckoId(symbol: string): string {
    const id = this.symbolToId[symbol];
    
    if (!id) {
      console.warn(`No CoinGecko ID mapping for symbol ${symbol}, using symbol as ID`);
      return symbol.toLowerCase();
    }
    
    return id;
  }
}
