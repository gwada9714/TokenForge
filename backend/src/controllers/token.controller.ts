import { Request, Response } from 'express';
import logger from '../utils/logger';
import { ProviderService } from '../services/provider.service';

export class TokenController {
  private providerService: ProviderService;

  constructor() {
    this.providerService = new ProviderService();
  }

  public getTokenDetails = async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const tokenDetails = await this.providerService.getTokenDetails(address);
      res.json(tokenDetails);
    } catch (error) {
      logger.error('Error in getTokenDetails:', error);
      res.status(500).json({ error: 'Failed to get token details' });
    }
  };

  public getUserTokens = async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const tokens = await this.providerService.getUserTokens(address);
      res.json(tokens);
    } catch (error) {
      logger.error('Error in getUserTokens:', error);
      res.status(500).json({ error: 'Failed to get user tokens' });
    }
  };

  public deployToken = async (req: Request, res: Response) => {
    try {
      const tokenData = req.body;
      const result = await this.providerService.deployToken(tokenData);
      res.json(result);
    } catch (error) {
      logger.error('Error in deployToken:', error);
      res.status(500).json({ error: 'Failed to deploy token' });
    }
  };
}
