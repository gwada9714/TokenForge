import { Router } from "express";
import walletRoutes from "./wallet.routes";
import tokenRoutes from "./token.routes";
import paymentRoutes from "./payment.routes";

const router = Router();

router.use("/wallets", walletRoutes);
router.use("/tokens", tokenRoutes);
router.use("/payments", paymentRoutes);

export default router;
