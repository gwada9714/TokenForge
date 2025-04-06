import express from "express";
import cors from "cors";
import { Contract } from "ethers";
import { TokensController } from "./controllers/tokens";
import { MarketplaceController } from "./controllers/marketplace";
import { createTokenRoutes } from "./routes/tokens";
import { createMarketplaceRoutes } from "./routes/marketplace";

export const createApi = (
  tokenForgeFactory: Contract,
  marketplaceContract: Contract
) => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Controllers
  const tokensController = new TokensController(tokenForgeFactory);
  const marketplaceController = new MarketplaceController(marketplaceContract);

  // Routes
  app.use("/api/tokens", createTokenRoutes(tokensController));
  app.use("/api/marketplace", createMarketplaceRoutes(marketplaceController));

  // Error handling
  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      console.error(err.stack);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  );

  return app;
};
