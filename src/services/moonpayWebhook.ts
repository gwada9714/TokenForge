import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import { moonpayService } from "./moonpayService";

export interface MoonPayWebhookPayload {
  id: string;
  type: "transaction_created" | "transaction_completed" | "transaction_failed";
  data: {
    id: string;
    status: string;
    walletAddress: string;
    cryptoAmount: string;
    cryptoCurrency: string;
    transactionHash?: string;
    failureReason?: string;
  };
}

export const handleMoonPayWebhook = async (
  payload: MoonPayWebhookPayload
): Promise<void> => {
  try {
    // Vérifier la signature du webhook (à implémenter côté serveur)
    const verifyWebhookSignature = httpsCallable(
      functions,
      "verifyMoonPayWebhookSignature"
    );
    await verifyWebhookSignature(payload);

    switch (payload.type) {
      case "transaction_created":
        // La transaction a été créée dans MoonPay
        break;

      case "transaction_completed":
        if (payload.data.transactionHash) {
          // Mettre à jour le statut de la transaction
          await moonpayService.updateTransactionStatus(
            payload.data.id,
            "completed",
            payload.data.transactionHash
          );
        }
        break;

      case "transaction_failed":
        // Mettre à jour le statut de la transaction comme échouée
        await moonpayService.updateTransactionStatus(payload.data.id, "failed");
        break;

      default:
        console.warn("Unhandled webhook type:", payload.type);
    }
  } catch (error) {
    console.error("Error handling MoonPay webhook:", error);
    throw error;
  }
};
