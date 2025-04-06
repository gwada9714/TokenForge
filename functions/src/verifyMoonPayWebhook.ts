import * as functions from "firebase-functions";
import * as crypto from "crypto";

const MOONPAY_WEBHOOK_SECRET = process.env.MOONPAY_WEBHOOK_SECRET;

export const verifyMoonPayWebhookSignature = functions.https.onCall(
  async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "The function must be called while authenticated."
        );
      }

      if (!MOONPAY_WEBHOOK_SECRET) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "MoonPay webhook secret is not configured."
        );
      }

      const { signature, payload } = data;

      // Vérifier la signature
      const computedSignature = crypto
        .createHmac("sha256", MOONPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest("base64");

      if (signature !== computedSignature) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Invalid webhook signature."
        );
      }

      return { valid: true };
    } catch (error) {
      console.error("Error verifying MoonPay webhook signature:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error verifying webhook signature."
      );
    }
  }
);
