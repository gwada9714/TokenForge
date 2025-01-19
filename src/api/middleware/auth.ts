import { Request, Response, NextFunction } from 'express';
import { verifyMessage } from 'ethers';

export interface AuthenticatedRequest extends Request {
  user?: {
    address: string;
    timestamp: number;
  };
  headers: Request['headers'] & {
    authorization?: string;
  };
  params: Request['params'] & {
    address?: string;
  };
  body: Request['body'] & {
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
        error: 'No authorization header',
      });
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header format',
      });
    }

    // Le token est au format: address.timestamp.signature
    const [address, timestamp, signature] = token.split('.');
    if (!address || !timestamp || !signature) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
      });
    }

    // Vérifier que le timestamp n'est pas expiré (15 minutes)
    const ts = parseInt(timestamp);
    if (Date.now() - ts > 15 * 60 * 1000) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      });
    }

    // Message à vérifier
    const message = `TokenForge API Authentication\nTimestamp: ${timestamp}`;

    // Vérifier la signature
    const recoveredAddress = verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature',
      });
    }

    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      address,
      timestamp: ts,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};
