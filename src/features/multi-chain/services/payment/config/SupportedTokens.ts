import { Address } from "viem";
import { PublicKey } from "@solana/web3.js";
import { PaymentNetwork } from "../types/PaymentSession";
import {
  NetworkTokensConfig,
  COMMON_TOKEN_ADDRESSES,
} from "../types/TokenConfig";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

export const SUPPORTED_NETWORKS: NetworkTokensConfig[] = [
  {
    network: PaymentNetwork.ETHEREUM,
    chainId: 1,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      type: "NATIVE",
    },
    tokens: [
      {
        address: ZERO_ADDRESS,
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        type: "NATIVE",
      },
      {
        address: COMMON_TOKEN_ADDRESSES.ETH_USDT,
        name: "Tether USD",
        symbol: "USDT",
        decimals: 6,
        type: "ERC20",
      },
      {
        address: COMMON_TOKEN_ADDRESSES.ETH_USDC,
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        type: "ERC20",
      },
      {
        address: COMMON_TOKEN_ADDRESSES.ETH_DAI,
        name: "Dai Stablecoin",
        symbol: "DAI",
        decimals: 18,
        type: "ERC20",
      },
    ],
    rpcUrls: ["https://eth.llamarpc.com"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  {
    network: PaymentNetwork.BINANCE,
    chainId: 56,
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
      type: "NATIVE",
    },
    tokens: [
      {
        address: ZERO_ADDRESS,
        name: "BNB",
        symbol: "BNB",
        decimals: 18,
        type: "NATIVE",
      },
      {
        address: COMMON_TOKEN_ADDRESSES.BSC_USDT,
        name: "Tether USD",
        symbol: "USDT",
        decimals: 18,
        type: "BEP20",
      },
      {
        address: COMMON_TOKEN_ADDRESSES.BSC_USDC,
        name: "USD Coin",
        symbol: "USDC",
        decimals: 18,
        type: "BEP20",
      },
      {
        address: COMMON_TOKEN_ADDRESSES.BSC_BUSD,
        name: "Binance USD",
        symbol: "BUSD",
        decimals: 18,
        type: "BEP20",
      },
    ],
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  {
    network: PaymentNetwork.POLYGON,
    chainId: 137,
    nativeCurrency: {
      name: "Polygon",
      symbol: "MATIC",
      decimals: 18,
      type: "NATIVE",
    },
    tokens: [
      {
        address: ZERO_ADDRESS,
        name: "Polygon",
        symbol: "MATIC",
        decimals: 18,
        type: "NATIVE",
      },
      {
        address: COMMON_TOKEN_ADDRESSES.POLYGON_USDT,
        name: "Tether USD",
        symbol: "USDT",
        decimals: 6,
        type: "ERC20",
      },
      {
        address: COMMON_TOKEN_ADDRESSES.POLYGON_USDC,
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        type: "ERC20",
      },
      {
        address: COMMON_TOKEN_ADDRESSES.POLYGON_DAI,
        name: "Dai Stablecoin",
        symbol: "DAI",
        decimals: 18,
        type: "ERC20",
      },
    ],
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  {
    network: PaymentNetwork.SOLANA,
    chainId: 101,
    nativeCurrency: {
      name: "Solana",
      symbol: "SOL",
      decimals: 9,
      type: "NATIVE",
    },
    tokens: [
      {
        address: new PublicKey("So11111111111111111111111111111111111111112"),
        name: "Solana",
        symbol: "SOL",
        decimals: 9,
        type: "NATIVE",
      },
      {
        address: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        type: "SPL",
      },
      {
        address: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
        name: "Tether USD",
        symbol: "USDT",
        decimals: 6,
        type: "SPL",
      },
    ],
    rpcUrls: ["https://api.mainnet-beta.solana.com"],
    blockExplorerUrls: ["https://explorer.solana.com"],
  },
];

export const getNetworkConfig = (
  network: PaymentNetwork
): NetworkTokensConfig => {
  const config = SUPPORTED_NETWORKS.find((n) => n.network === network);
  if (!config) {
    throw new Error(`Network ${network} not supported`);
  }
  return config;
};

export const getTokenConfig = (
  network: PaymentNetwork,
  tokenAddress: Address | PublicKey
) => {
  const networkConfig = getNetworkConfig(network);
  const token = networkConfig.tokens.find((t) => t.address === tokenAddress);
  if (!token) {
    throw new Error(
      `Token ${tokenAddress.toString()} not supported on network ${network}`
    );
  }
  return token;
};
