/**
 * Service pour la récupération des prix des cryptomonnaies
 * Fournit des méthodes pour obtenir les taux de change et les prix des cryptos
 */
class PriceOracleService {
  constructor() {
    // Prix fictifs pour la démo
    this.prices = {
      ETH: { EUR: 2000, USD: 2200 },
      BTC: { EUR: 50000, USD: 55000 },
      MATIC: { EUR: 1.2, USD: 1.3 },
      BNB: { EUR: 300, USD: 330 },
      AVAX: { EUR: 30, USD: 33 },
      SOL: { EUR: 100, USD: 110 },
      USDT: { EUR: 0.91, USD: 1 },
      USDC: { EUR: 0.91, USD: 1 },
      DAI: { EUR: 0.91, USD: 1 }
    };
    
    // Taux de change EUR/USD
    this.eurUsdRate = 1.1;
  }
  
  /**
   * Récupère le prix d'une cryptomonnaie dans une devise donnée
   * @param {string} cryptoSymbol Symbole de la cryptomonnaie
   * @param {string} currency Devise (EUR, USD)
   * @returns {Promise<number>} Prix de la cryptomonnaie
   */
  async getCryptoPrice(cryptoSymbol, currency = 'EUR') {
    const symbol = cryptoSymbol.toUpperCase();
    const curr = currency.toUpperCase();
    
    if (!this.prices[symbol]) {
      throw new Error(`Cryptocurrency ${symbol} not supported`);
    }
    
    if (!this.prices[symbol][curr]) {
      throw new Error(`Currency ${curr} not supported`);
    }
    
    return this.prices[symbol][curr];
  }
  
  /**
   * Récupère le taux de change EUR/USD
   * @returns {Promise<number>} Taux de change EUR/USD
   */
  async getEURUSDRate() {
    return this.eurUsdRate;
  }
  
  /**
   * Convertit un montant d'une devise à une autre
   * @param {number} amount Montant à convertir
   * @param {string} fromCurrency Devise source
   * @param {string} toCurrency Devise cible
   * @returns {Promise<number>} Montant converti
   */
  async convertCurrency(amount, fromCurrency, toCurrency) {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();
    
    if (from === to) {
      return amount;
    }
    
    if (from === 'EUR' && to === 'USD') {
      return amount * this.eurUsdRate;
    }
    
    if (from === 'USD' && to === 'EUR') {
      return amount / this.eurUsdRate;
    }
    
    throw new Error(`Conversion from ${from} to ${to} not supported`);
  }
}

module.exports = PriceOracleService;
