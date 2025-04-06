import { type Chain } from "viem";
import { mainnet, polygon, arbitrum, optimism, base } from "viem/chains";

export type SupportedChain =
  | typeof mainnet
  | typeof polygon
  | typeof arbitrum
  | typeof optimism
  | typeof base;

export interface ChainConfig {
  chain: SupportedChain;
  factoryAddress: `0x${string}`;
  routerAddress: `0x${string}`;
  wethAddress: `0x${string}`;
  multicallAddress: `0x${string}`;
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  [mainnet.id]: {
    chain: mainnet,
    factoryAddress: "0x1234567890123456789012345678901234567890",
    routerAddress: "0x1234567890123456789012345678901234567890",
    wethAddress: "0x1234567890123456789012345678901234567890",
    multicallAddress: "0x1234567890123456789012345678901234567890",
  },
  [polygon.id]: {
    chain: polygon,
    factoryAddress: "0x1234567890123456789012345678901234567890",
    routerAddress: "0x1234567890123456789012345678901234567890",
    wethAddress: "0x1234567890123456789012345678901234567890",
    multicallAddress: "0x1234567890123456789012345678901234567890",
  },
  [arbitrum.id]: {
    chain: arbitrum,
    factoryAddress: "0x1234567890123456789012345678901234567890",
    routerAddress: "0x1234567890123456789012345678901234567890",
    wethAddress: "0x1234567890123456789012345678901234567890",
    multicallAddress: "0x1234567890123456789012345678901234567890",
  },
  [optimism.id]: {
    chain: optimism,
    factoryAddress: "0x1234567890123456789012345678901234567890",
    routerAddress: "0x1234567890123456789012345678901234567890",
    wethAddress: "0x1234567890123456789012345678901234567890",
    multicallAddress: "0x1234567890123456789012345678901234567890",
  },
  [base.id]: {
    chain: base,
    factoryAddress: "0x1234567890123456789012345678901234567890",
    routerAddress: "0x1234567890123456789012345678901234567890",
    wethAddress: "0x1234567890123456789012345678901234567890",
    multicallAddress: "0x1234567890123456789012345678901234567890",
  },
} as const;
