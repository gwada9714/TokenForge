export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  seller: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  status: 'active' | 'sold' | 'cancelled';
  createdAt: number;
  updatedAt: number;
}

export interface MarketplaceFilters {
  status?: 'active' | 'sold' | 'cancelled';
  minPrice?: string;
  maxPrice?: string;
  seller?: string;
  sortBy?: 'price' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}

export interface MarketplaceStats {
  totalItems: number;
  totalVolume: string;
  activeItems: number;
  soldItems: number;
}
