import { Request, Response } from 'express';
import { Contract, JsonRpcProvider } from 'ethers';
import { AuthenticatedRequest } from '../middleware/auth';
import type { TokenData, TokenFilters, ApiResponse } from '../types';

export class TokensController {
  private tokenForgeFactory: Contract;
  private provider: JsonRpcProvider;

  constructor(factoryContract: Contract) {
    this.tokenForgeFactory = factoryContract;
    this.provider = factoryContract.provider as JsonRpcProvider;
  }

  // Récupérer les tokens d'un utilisateur
  public getUserTokens = async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<TokenData[]>>
  ) => {
    try {
      const address = req.params.address;
      if (!address) {
        return res.status(400).json({
          success: false,
          error: 'Address parameter is required',
        });
      }
      
      // Vérifier que l'utilisateur a accès à ces informations
      if (req.user?.address.toLowerCase() !== address.toLowerCase()) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized access',
        });
      }

      const tokenAddresses = await this.tokenForgeFactory.getUserTokens(address);
      const tokens: TokenData[] = await Promise.all(
        tokenAddresses.map(async (tokenAddress: string) => {
          const token = new Contract(tokenAddress, [], this.provider);
          const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
            token.name(),
            token.symbol(),
            token.decimals(),
            token.totalSupply(),
            token.owner(),
          ]);

          return {
            address: tokenAddress,
            name,
            symbol,
            decimals,
            totalSupply: totalSupply.toString(),
            owner,
          };
        })
      );

      res.json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user tokens',
      });
    }
  };

  // Récupérer les détails d'un token
  public getTokenDetails = async (
    req: Request,
    res: Response<ApiResponse<TokenData>>
  ) => {
    try {
      const { address } = req.params;
      const token = new Contract(address, [], this.provider);

      const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
        token.name(),
        token.symbol(),
        token.decimals(),
        token.totalSupply(),
        token.owner(),
      ]);

      res.json({
        success: true,
        data: {
          address,
          name,
          symbol,
          decimals,
          totalSupply: totalSupply.toString(),
          owner,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch token details',
      });
    }
  };

  // Rechercher des tokens
  public searchTokens = async (
    req: Request<{}, {}, {}, TokenFilters>,
    res: Response<ApiResponse<TokenData[]>>
  ) => {
    try {
      const { owner, symbol, page = 1, limit = 10 } = req.query;
      let tokens: TokenData[] = [];

      // Implémentation de la recherche avec pagination
      if (owner) {
        const addresses = await this.tokenForgeFactory.getUserTokens(owner);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedAddresses = addresses.slice(startIndex, endIndex);

        tokens = await Promise.all(
          paginatedAddresses.map(async (addr: string) => {
            const token = new Contract(addr, [], this.provider);
            const [name, tokenSymbol, decimals, totalSupply, tokenOwner] = await Promise.all([
              token.name(),
              token.symbol(),
              token.decimals(),
              token.totalSupply(),
              token.owner(),
            ]);

            // Filtrer par symbole si spécifié
            if (symbol && tokenSymbol.toLowerCase() !== symbol.toLowerCase()) {
              return null;
            }

            return {
              address: addr,
              name,
              symbol: tokenSymbol,
              decimals,
              totalSupply: totalSupply.toString(),
              owner: tokenOwner,
            };
          })
        );

        // Filtrer les tokens null (qui ne correspondent pas au symbole)
        tokens = tokens.filter((token): token is TokenData => token !== null);
      }

      res.json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to search tokens',
      });
    }
  };
}
