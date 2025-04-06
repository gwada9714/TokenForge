import { Request, Response, NextFunction } from "express";
import { verifyMessage } from "viem";

export interface AuthenticatedRequest extends Request {
  user?: {
    address: string;
    timestamp: number;
  };
  headers: Request["headers"] & {
    authorization?: string;
  };
  params: Request["params"] & {
    address?: string;
  };
  body: Request["body"] & {
    tokenAddress?: string;
    amount?: string;
    price?: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "No authorization header",
      });
    }

    // Format attendu: "Bearer address:signature:timestamp"
    const [, credentials] = authHeader.split(" ");
    if (!credentials) {
      return res.status(401).json({
        success: false,
        error: "Invalid authorization format",
      });
    }

    const [address, signature, timestamp] = credentials.split(":");
    if (!address || !signature || !timestamp) {
      return res.status(401).json({
        success: false,
        error: "Missing authentication parameters",
      });
    }

    // Vérifier que le timestamp n'est pas trop ancien (5 minutes max)
    const timestampNum = parseInt(timestamp);
    const now = Date.now();
    if (now - timestampNum > 5 * 60 * 1000) {
      return res.status(401).json({
        success: false,
        error: "Signature expired",
      });
    }

    // Message à vérifier
    const message = `TokenForge API Authentication\nTimestamp: ${timestamp}`;

    // Vérifier la signature avec viem
    const isValid = await verifyMessage({
      address,
      message,
      signature,
    });

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid signature",
      });
    }

    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      address: address.toLowerCase(),
      timestamp: timestampNum,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
