import { Router } from 'express';
import { TokensController } from '../controllers/tokens';
import { authMiddleware } from '../middleware/auth';

export const createTokenRoutes = (controller: TokensController) => {
  const router = Router();

  // Routes publiques
  router.get('/search', controller.searchTokens);
  router.get('/:address', controller.getTokenDetails);

  // Routes authentifiées
  router.get('/user/:address', authMiddleware, controller.getUserTokens);

  return router;
};
