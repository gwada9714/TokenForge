import { TokenContract } from '@/providers/contract/ContractProvider';

export interface TokenMetrics {
  address: string | null;
  chainId: number;
  name: string | null;
  symbol: string | null;
  decimals: number;
  totalSupply: string;
  holders: number;
  transactions: {
    total: number;
    buy: number;
    sell: number;
    transfer: number;
  };
  volume: string;
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

export type ChartPeriod = 'daily' | 'weekly' | 'monthly';

export interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      position?: 'top' | 'bottom' | 'left' | 'right';
      display?: boolean;
    };
    tooltip?: {
      enabled?: boolean;
    };
  };
  scales?: {
    y?: {
      beginAtZero?: boolean;
      ticks?: {
        stepSize?: number;
      };
    };
  };
}

export interface TokenChartProps {
  token?: TokenContract;
  period: ChartPeriod;
  height?: number;
  className?: string;
}
