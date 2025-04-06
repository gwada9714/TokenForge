import logger from "../utils/logger";

export class MoonPayService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.MOONPAY_API_KEY || "";
    this.baseUrl = process.env.MOONPAY_BASE_URL || "https://api.moonpay.com";
  }

  public async createBuyUrl(
    walletAddress: string,
    currency: string,
    amount: number
  ): Promise<string> {
    try {
      const baseUrl = "https://buy.moonpay.com";
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        walletAddress,
        currencyCode: currency,
        baseCurrencyAmount: amount.toString(),
      });

      return `${baseUrl}?${params.toString()}`;
    } catch (error) {
      logger.error("Error creating MoonPay URL:", error);
      throw error;
    }
  }

  public async handleWebhook(webhookData: any): Promise<void> {
    try {
      // Vérifier la signature du webhook si nécessaire

      // Traiter les différents types d'événements
      switch (webhookData.type) {
        case "transaction_created":
          await this.handleTransactionCreated(webhookData);
          break;
        case "transaction_completed":
          await this.handleTransactionCompleted(webhookData);
          break;
        case "transaction_failed":
          await this.handleTransactionFailed(webhookData);
          break;
        default:
          logger.info(`Unhandled webhook event type: ${webhookData.type}`);
      }
    } catch (error) {
      logger.error("Error handling webhook:", error);
      throw error;
    }
  }

  private async handleTransactionCreated(data: any): Promise<void> {
    // Implémenter la logique pour les transactions créées
    logger.info("Transaction created:", data);
  }

  private async handleTransactionCompleted(data: any): Promise<void> {
    // Implémenter la logique pour les transactions complétées
    logger.info("Transaction completed:", data);
  }

  private async handleTransactionFailed(data: any): Promise<void> {
    // Implémenter la logique pour les transactions échouées
    logger.error("Transaction failed:", data);
  }
}
