/// <reference path="../../types/express.d.ts" />

import { Request, Response } from 'express-serve-static-core';
import { BigNumberish } from 'ethers';
import { Web3Contract } from '../../types/web3';
import { MarketplaceFilters, MarketplaceData, ApiResponse } from '../../types/marketplace';

export class MarketplaceController {
  private marketplaceContract: Web3Contract;
  private publicClient: any;

  constructor(marketplaceContract: Web3Contract, publicClient: any) {
    this.marketplaceContract = marketplaceContract;
    this.publicClient = publicClient;
  }

  async getItems(
    req: Request<{}, any, any, MarketplaceFilters>,
    res: Response<ApiResponse<MarketplaceData[]>>
  ) {
    try {
      const { minPrice, maxPrice, seller, status } = req.query;

      const itemCount = await this.marketplaceContract.getItemCount?.();
      if (!itemCount) throw new Error('Failed to get item count');

      const items: MarketplaceData[] = [];

      for (let i = 0; i < itemCount; i++) {
        const item = await this.marketplaceContract.getItem?.(i);
        if (!item) continue;

        const [tokenId, seller, price, sold, active] = item;
        const itemPrice = price.toString();

        // Apply filters
        if (seller && seller.toLowerCase() !== seller.toLowerCase()) continue;
        if (status === 'active' && !active) continue;
        if (status === 'inactive' && active) continue;
        if (status === 'sold' && !sold) continue;
        if (status === 'unsold' && sold) continue;
        if (minPrice && BigInt(itemPrice) < BigInt(minPrice)) continue;
        if (maxPrice && BigInt(itemPrice) > BigInt(maxPrice)) continue;

        items.push({
          id: i.toString(),
          tokenId: tokenId.toString(),
          seller,
          price: BigInt(itemPrice),
          sold,
          active
        });
      }

      return res.json({
        success: true,
        data: items
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getItem(
    req: Request<{ id: string }>,
    res: Response<ApiResponse<MarketplaceData>>
  ) {
    try {
      const { id } = req.params;
      const item = await this.marketplaceContract.getItem?.(id);
      if (!item) throw new Error('Item not found');

      const [tokenId, seller, price, sold, active] = item;

      return res.json({
        success: true,
        data: {
          id,
          tokenId: tokenId.toString(),
          seller,
          price: BigInt(price.toString()),
          sold,
          active
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async listItem(
    req: Request<{}, any, { tokenAddress: string; amount: string; price: string }>,
    res: Response<ApiResponse<MarketplaceData>>
  ) {
    try {
      const { tokenAddress, amount, price } = req.body;
      if (!req.user?.address) throw new Error('User not authenticated');

      // Check token allowance
      const token = this.publicClient.getContract(tokenAddress);
      const allowance = await token.allowance?.(req.user.address, this.marketplaceContract.address);
      if (!allowance || BigInt(allowance) < BigInt(amount)) {
        throw new Error('Insufficient token allowance');
      }

      // List item
      const tx = await this.marketplaceContract.listItem?.(tokenAddress, amount, price);
      if (!tx) throw new Error('Failed to list item');

      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === 'ItemListed');
      if (!event) throw new Error('Failed to get item listed event');

      const [itemId] = event.args;
      const listedItem = await this.marketplaceContract.getItem?.(itemId);
      if (!listedItem) throw new Error('Failed to get listed item');

      const [tokenId, seller, itemPrice, sold, active] = listedItem;

      return res.json({
        success: true,
        data: {
          id: itemId.toString(),
          tokenId: tokenId.toString(),
          seller,
          price: BigInt(itemPrice.toString()),
          sold,
          active
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
