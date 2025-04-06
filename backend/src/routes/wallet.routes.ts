import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { WalletController } from "../controllers/wallet.controller";
import { createWalletSchema } from "../validators/wallet.validator";

const router = Router();
const walletController = new WalletController();

router.post(
  "/create",
  validateRequest(createWalletSchema),
  walletController.createTemporaryWallet
);

router.get("/:address", walletController.getWalletDetails);

router.get("/:address/balance", walletController.getWalletBalance);

export default router;
