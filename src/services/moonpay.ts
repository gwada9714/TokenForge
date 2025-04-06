import {
  MoonPayConfig,
  MoonPayQuote,
  MoonPayTransaction,
} from "../types/moonpay";

class MoonPayService {
  private config: MoonPayConfig;

  constructor(config: MoonPayConfig) {
    this.config = config;
  }

  private getSignedUrl(originalUrl: string): string {
    // In a real implementation, this would call your backend to sign the URL
    // For now, we'll just return the original URL
    return originalUrl;
  }

  async getQuote(
    baseCurrencyAmount: number,
    baseCurrency: string = "usd",
    quoteCurrency: string = "eth"
  ): Promise<MoonPayQuote> {
    const url = new URL(
      `${this.config.baseUrl}/v3/currencies/${quoteCurrency}/quote`
    );
    url.searchParams.append("apiKey", this.config.apiKey);
    url.searchParams.append(
      "baseCurrencyAmount",
      baseCurrencyAmount.toString()
    );
    url.searchParams.append("baseCurrency", baseCurrency);

    const response = await fetch(this.getSignedUrl(url.toString()));
    if (!response.ok) {
      throw new Error("Failed to get quote from MoonPay");
    }

    return response.json();
  }

  async createTransaction(
    walletAddress: string,
    baseCurrencyAmount: number,
    baseCurrency: string = "usd",
    quoteCurrency: string = "eth"
  ): Promise<MoonPayTransaction> {
    const url = new URL(`${this.config.baseUrl}/v3/transactions`);
    url.searchParams.append("apiKey", this.config.apiKey);

    const response = await fetch(this.getSignedUrl(url.toString()), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
        baseCurrencyAmount,
        baseCurrency,
        quoteCurrency,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create transaction with MoonPay");
    }

    return response.json();
  }

  getWidgetUrl(walletAddress: string): string {
    const url = new URL("https://buy.moonpay.com");
    url.searchParams.append("apiKey", this.config.apiKey);
    url.searchParams.append("walletAddress", walletAddress);
    url.searchParams.append("currencyCode", "eth");

    return this.getSignedUrl(url.toString());
  }
}

export const moonpayService = new MoonPayService({
  apiKey: process.env.REACT_APP_MOONPAY_API_KEY || "",
  baseUrl: process.env.REACT_APP_MOONPAY_BASE_URL || "https://api.moonpay.com",
  environment: (process.env.REACT_APP_MOONPAY_ENVIRONMENT || "sandbox") as
    | "live"
    | "sandbox",
});
