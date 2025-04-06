export interface NetworkConfig {
  chainId: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconUrl: string;
}

export interface NetworkGasEstimates {
  low: number;
  medium: number;
  high: number;
  timestamp: number;
}

export interface NetworkTaxConfig {
  chainId: number;
  baseTaxRate: number;
  maxAdditionalTaxRate: number;
  minTokenAmount: string; // en wei
  deploymentCost: {
    estimated: string; // en wei
    currency: string;
  };
  taxCollector: string; // adresse du contrat qui collecte les taxes
}

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    chainId: 1,
    name: "Ethereum",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://eth.llamarpc.com"],
    blockExplorerUrls: ["https://etherscan.io"],
    iconUrl: "/images/networks/ethereum.svg",
  },
  {
    chainId: 56,
    name: "BNB Smart Chain",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    blockExplorerUrls: ["https://bscscan.com"],
    iconUrl: "/images/networks/binance.svg",
  },
  {
    chainId: 137,
    name: "Polygon",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
    iconUrl: "/images/networks/polygon.svg",
  },
  {
    chainId: 43114,
    name: "Avalanche",
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io"],
    iconUrl: "/images/networks/avalanche.svg",
  },
];
