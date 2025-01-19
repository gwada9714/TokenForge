import { Request, Response } from 'express';
import { Contract, JsonRpcProvider, parseUnits } from 'ethers';
import { AuthenticatedRequest } from '../middleware/auth';
import type { MarketplaceData, MarketplaceFilters, ApiResponse } from '../types';

export class MarketplaceController {
  private marketplaceContract: Contract;
  private provider: JsonRpcProvider;

  constructor(marketplaceContract: Contract) {
    this.marketplaceContract = marketplaceContract;
    this.provider = marketplaceContract.provider as JsonRpcProvider;
  }

  // Récupérer les items du marketplace
  public getItems = async (
    req: Request<{}, {}, {}, MarketplaceFilters>,
    res: Response<ApiResponse<MarketplaceData[]>>
  ) => {
    try {
      const {
        seller,
        status,
        minPrice,
        maxPrice,
        page = 1,
        limit = 10,
        sortBy = 'price',
        sortDirection = 'asc'
      } = req.query;

      // Récupération des items depuis le contrat
      const itemCount = await this.marketplaceContract.getItemCount();
      let items: MarketplaceData[] = [];

      // Récupérer tous les items qui correspondent aux filtres
      for (let i = 0; i < itemCount; i++) {
        const item = await this.marketplaceContract.getItem(i);
        if (!item) continue;

        const itemStatus = item.active ? 'active' : 'sold';
        const itemPrice = item.price.toString();

        // Appliquer les filtres
        if (seller && item.seller.toLowerCase() !== seller.toLowerCase()) continue;
        if (status && itemStatus !== status) continue;
        if (minPrice && parseUnits(itemPrice, 18).lt(parseUnits(minPrice, 18))) continue;
        if (maxPrice && parseUnits(itemPrice, 18).gt(parseUnits(maxPrice, 18))) continue;

        items.push({
          id: i.toString(),
          tokenAddress: item.tokenAddress,
          price: itemPrice,
          amount: item.amount.toString(),
          seller: item.seller,
          status: itemStatus,
        });
      }

      // Trier les items
      items.sort((a, b) => {
        const aValue = sortBy === 'price' ? parseUnits(a.price, 18) : BigInt(a.id);
        const bValue = sortBy === 'price' ? parseUnits(b.price, 18) : BigInt(b.id);
        return sortDirection === 'asc' 
          ? Number(aValue - bValue)
          : Number(bValue - aValue);
      });

      // Appliquer la pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      items = items.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch marketplace items',
      });
    }
  };

  // Récupérer les détails d'un item
  public getItemDetails = async (
    req: Request,
    res: Response<ApiResponse<MarketplaceData>>
  ) => {
    try {
      const { id } = req.params;
      const item = await this.marketplaceContract.getItem(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Item not found',
        });
      }

      res.json({
        success: true,
        data: {
          id,
          tokenAddress: item.tokenAddress,
          price: item.price.toString(),
          amount: item.amount.toString(),
          seller: item.seller,
          status: item.active ? 'active' : 'sold',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch item details',
      });
    }
  };

  // Créer un nouvel item
  public createItem = async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<MarketplaceData>>
  ) => {
    try {
      const { tokenAddress, amount, price } = req.body;
      
      if (!req.user?.address) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      // Vérifier que l'utilisateur a approuvé le marketplace
      const token = new Contract(tokenAddress, [], this.provider);
      const allowance = await token.allowance(req.user.address, this.marketplaceContract.address);
      
      if (allowance.lt(amount)) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient allowance',
        });
      }

      const tx = await this.marketplaceContract.listItem(tokenAddress, amount, price);
      const receipt = await tx.wait();

      // Récupérer l'ID de l'item depuis les événements
      const event = receipt.events?.find(e => e.event === 'ItemListed');
      const itemId = event?.args?.itemId;

      res.json({
        success: true,
        data: {
          id: itemId.toString(),
          tokenAddress,
          price: price.toString(),
          amount: amount.toString(),
          seller: req.user.address,
          status: 'active',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create marketplace item',
      });
    }
  };
}
