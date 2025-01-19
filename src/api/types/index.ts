export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string;
}

export interface MarketplaceData {
  id: string;
  tokenAddress: string;
  price: string;
  amount: string;
  seller: string;
  status: 'active' | 'sold' | 'cancelled';
}

export interface UserData {
  address: string;
  tokens: TokenData[];
  listings: MarketplaceData[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface TokenFilters extends PaginationParams {
  owner?: string;
  symbol?: string;
}

export interface MarketplaceFilters extends PaginationParams {
  seller?: string;
  status?: 'active' | 'sold' | 'cancelled';
  minPrice?: string;
  maxPrice?: string;
}
