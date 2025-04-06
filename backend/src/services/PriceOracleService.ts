/**
 * Service pour obtenir les taux de change entre crypto et monnaies fiat
 * Utilise des APIs externes pour récupérer les prix en temps réel
 */
class PriceOracleService {
  // Cache pour les prix avec timestamp
  private priceCache: Record<string, { price: number; timestamp: number }> = {};

  // Durée de validité du cache en millisecondes (5 minutes)
  private cacheDuration = 5 * 60 * 1000;

  /**
   * Obtient le prix actuel d'une cryptomonnaie dans la devise spécifiée
   * @param cryptoSymbol Symbole de la crypto (ETH, BTC, etc.)
   * @param fiatCurrency Devise cible (EUR, USD, etc.)
   * @returns Le prix de la crypto dans la devise spécifiée
   */
  async getCryptoPrice(
    cryptoSymbol: string,
    fiatCurrency: string
  ): Promise<number> {
    const cacheKey = `${cryptoSymbol}-${fiatCurrency}`;

    // Vérifier si le prix est en cache et encore valide
    const cachedData = this.priceCache[cacheKey];
    if (cachedData && Date.now() - cachedData.timestamp < this.cacheDuration) {
      return cachedData.price;
    }

    try {
      // Dans une implémentation réelle, on appellerait une API comme CoinGecko
      // Pour la démo, on retourne des valeurs fixes
      let price: number;

      if (cryptoSymbol === "EUR" && fiatCurrency === "USD") {
        price = 1.08; // Taux EUR/USD
      } else if (cryptoSymbol === "ETH" && fiatCurrency === "EUR") {
        price = 2500; // Prix ETH en EUR
      } else if (cryptoSymbol === "BNB" && fiatCurrency === "EUR") {
        price = 350; // Prix BNB en EUR
      } else if (cryptoSymbol === "MATIC" && fiatCurrency === "EUR") {
        price = 0.75; // Prix MATIC en EUR
      } else if (cryptoSymbol === "AVAX" && fiatCurrency === "EUR") {
        price = 30; // Prix AVAX en EUR
      } else if (cryptoSymbol === "SOL" && fiatCurrency === "EUR") {
        price = 120; // Prix SOL en EUR
      } else if (cryptoSymbol.includes("USD") && fiatCurrency === "EUR") {
        price = 0.93; // Prix stablecoins USD en EUR
      } else {
        // Valeur par défaut
        price = 100;
      }

      // Mettre en cache
      this.priceCache[cacheKey] = {
        price,
        timestamp: Date.now(),
      };

      return price;
    } catch (error) {
      console.error("Error fetching crypto price:", error);

      // En cas d'erreur, retourner une valeur par défaut ou la dernière valeur connue
      if (cachedData) {
        return cachedData.price;
      }

      // Valeurs par défaut en cas d'absence de cache
      if (cryptoSymbol === "ETH") return 2500;
      if (cryptoSymbol === "BNB") return 350;
      if (cryptoSymbol === "MATIC") return 0.75;
      if (cryptoSymbol === "AVAX") return 30;
      if (cryptoSymbol === "SOL") return 120;
      if (cryptoSymbol.includes("USD")) return 0.93;

      return 100; // Valeur par défaut générique
    }
  }

  /**
   * Obtient le taux de change EUR/USD
   * @returns Le taux EUR/USD actuel
   */
  async getEURUSDRate(): Promise<number> {
    return this.getCryptoPrice("EUR", "USD");
  }

  /**
   * Convertit un montant de EUR vers une crypto spécifiée
   * @param amountEUR Montant en EUR
   * @param cryptoSymbol Symbole de la cryptomonnaie
   * @returns Montant en crypto
   */
  async convertEURToCrypto(
    amountEUR: number,
    cryptoSymbol: string
  ): Promise<number> {
    // Obtenir le taux de change
    const cryptoPrice = await this.getCryptoPrice(cryptoSymbol, "EUR");

    // Calculer le montant en crypto
    return amountEUR / cryptoPrice;
  }

  /**
   * Convertit un montant de crypto vers EUR
   * @param amountCrypto Montant en crypto
   * @param cryptoSymbol Symbole de la cryptomonnaie
   * @returns Montant en EUR
   */
  async convertCryptoToEUR(
    amountCrypto: number,
    cryptoSymbol: string
  ): Promise<number> {
    // Obtenir le taux de change
    const cryptoPrice = await this.getCryptoPrice(cryptoSymbol, "EUR");

    // Calculer le montant en EUR
    return amountCrypto * cryptoPrice;
  }

  /**
   * Vide le cache des prix
   */
  clearCache(): void {
    this.priceCache = {};
  }
}

module.exports = PriceOracleService;
