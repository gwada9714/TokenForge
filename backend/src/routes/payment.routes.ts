import express from "express";
import { validateRequest } from "../middleware/validateRequest";
import { PaymentController } from "../controllers/payment.controller";

const router = express.Router();
const paymentController = new PaymentController();

// Route pour créer une URL de paiement MoonPay
router.post(
  "/moonpay/url",
  validateRequest,
  paymentController.createMoonPayUrl
);

// Route pour gérer les webhooks de MoonPay
router.post("/moonpay/webhook", paymentController.handleMoonPayWebhook);

export default router;
