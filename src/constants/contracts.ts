import { type Address } from "viem";
import { type NetworkContract } from "../types/contracts";

// Adresses des contrats pour Sepolia (testnet)
const sepoliaAddresses: NetworkContract = {
  tokenFactory: {
    address: "0xE2b29a1D3021027aF7AC8dAe5e230922F3247a0A" as Address,
    blockCreated: 4173922,
  },
  platformToken: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    blockCreated: 0,
  },
  plans: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    blockCreated: 0,
  },
  liquidityLocker: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    blockCreated: 0,
  },
  staking: {
    address: "0xF8ee9A71f42a35A6d18677629Ef6B4A7dE9d4Cb7" as Address,
    blockCreated: 4173925,
  },
  launchpad: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    blockCreated: 0,
  },
};

// Adresses des contrats pour Mainnet (production)
const mainnetAddresses: NetworkContract = {
  tokenFactory: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    blockCreated: 0,
  },
  platformToken: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    blockCreated: 0,
  },
  plans: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    blockCreated: 0,
  },
  liquidityLocker: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    blockCreated: 0,
  },
  staking: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    blockCreated: 0,
  },
  launchpad: {
    address: "0x0000000000000000000000000000000000000000" as Address,
    blockCreated: 0,
  },
};

// Export des adresses de contrats par réseau
export const contractAddresses = {
  mainnet: mainnetAddresses,
  sepolia: sepoliaAddresses,
};

// Export des adresses individuelles pour Sepolia (réseau par défaut)
export const {
  tokenFactory: SEPOLIA_TOKEN_FACTORY,
  staking: SEPOLIA_STAKING,
  platformToken: SEPOLIA_PLATFORM_TOKEN,
  plans: SEPOLIA_PLANS,
  liquidityLocker: SEPOLIA_LIQUIDITY_LOCKER,
  launchpad: SEPOLIA_LAUNCHPAD,
} = sepoliaAddresses;

// Export des adresses individuelles pour Mainnet
export const {
  tokenFactory: MAINNET_TOKEN_FACTORY,
  staking: MAINNET_STAKING,
  platformToken: MAINNET_PLATFORM_TOKEN,
  plans: MAINNET_PLANS,
  liquidityLocker: MAINNET_LIQUIDITY_LOCKER,
  launchpad: MAINNET_LAUNCHPAD,
} = mainnetAddresses;
