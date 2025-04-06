"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMoonPayWebhookSignature = void 0;
const functions = require("firebase-functions");
const crypto = require("crypto");
const MOONPAY_WEBHOOK_SECRET = process.env.MOONPAY_WEBHOOK_SECRET;
exports.verifyMoonPayWebhookSignature = functions.https.onCall(
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
//# sourceMappingURL=verifyMoonPayWebhook.js.map
