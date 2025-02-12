import { BigNumber } from 'ethers';

export interface MarketplaceFilters {
  minPrice?: string;
  maxPrice?: string;
  seller?: string;
  status?: string;
  tokenId?: string;
}

export interface MarketplaceData {
  id: string;
  seller: string;
  tokenId: string;
  price: bigint;
  sold: boolean;
  active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
