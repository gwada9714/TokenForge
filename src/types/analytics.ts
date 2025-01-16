export interface TokenMetrics {
  address: string;
  network: string;
  holders: number;
  totalSupply: string;
  circulatingSupply: string;
  marketCap: string;
  price: string;
  volume24h: string;
  transactions: {
    total: number;
    buy: number;
    sell: number;
    transfer: number;
  };
  liquidity: {
    total: string;
    pairs: Array<{
      dex: string;
      pair: string;
      liquidity: string;
      price: string;
      volume24h: string;
    }>;
  };
  timestamp: Date;
}

export interface TokenEvent {
  type: 'transfer' | 'buy' | 'sell' | 'mint' | 'burn' | 'addLiquidity' | 'removeLiquidity';
  hash: string;
  from: string;
  to: string;
  amount: string;
  price?: string;
  timestamp: Date;
  blockNumber: number;
}

export interface TokenAnalytics {
  token: {
    address: string;
    network: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  metrics: TokenMetrics;
  history: {
    prices: Array<{
      timestamp: Date;
      price: string;
    }>;
    volumes: Array<{
      timestamp: Date;
      volume: string;
    }>;
    holders: Array<{
      timestamp: Date;
      count: number;
    }>;
  };
  events: TokenEvent[];
}
