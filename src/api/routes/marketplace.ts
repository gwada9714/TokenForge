import { Router } from "express";
import { MarketplaceController } from "../controllers/marketplace";
import { authMiddleware } from "../middleware/auth";

export const createMarketplaceRoutes = (controller: MarketplaceController) => {
  const router = Router();

  // Routes publiques
  router.get("/", controller.getItems);
  router.get("/:id", controller.getItemDetails);

  // Routes authentifiées
  router.post("/", authMiddleware, controller.createItem);

  return router;
};
