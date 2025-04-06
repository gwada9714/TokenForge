import express from "express";
import { validateRequest } from "../middleware/validateRequest";
import { TokenController } from "../controllers/token.controller";

const router = express.Router();
const tokenController = new TokenController();

// Route pour récupérer les détails d'un token
router.get("/:address", validateRequest, tokenController.getTokenDetails);

// Route pour récupérer les tokens d'un utilisateur
router.get("/user/:address", validateRequest, tokenController.getUserTokens);

// Route pour déployer un nouveau token
router.post("/deploy", validateRequest, tokenController.deployToken);

export default router;
