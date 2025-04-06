import { Request, Response } from "express";
import logger from "../utils/logger";
import { MoonPayService } from "../services/moonpay.service";

export class PaymentController {
  private moonPayService: MoonPayService;

  constructor() {
    this.moonPayService = new MoonPayService();
  }

  public createMoonPayUrl = async (req: Request, res: Response) => {
    try {
      const { walletAddress, currency, amount } = req.body;
      const url = await this.moonPayService.createBuyUrl(
        walletAddress,
        currency,
        amount
      );
      res.json({ url });
    } catch (error) {
      logger.error("Error in createMoonPayUrl:", error);
      res.status(500).json({ error: "Failed to create MoonPay URL" });
    }
  };

  public handleMoonPayWebhook = async (req: Request, res: Response) => {
    try {
      const webhookData = req.body;
      await this.moonPayService.handleWebhook(webhookData);
      res.status(200).send("Webhook processed successfully");
    } catch (error) {
      logger.error("Error in handleMoonPayWebhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  };
}
