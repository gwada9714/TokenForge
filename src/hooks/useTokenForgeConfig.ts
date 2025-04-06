import { usePublicClient } from "wagmi";
import { Address } from "viem";

interface TokenForgeConfig {
  contractAddress: Address;
  chainId: number;
  networkName: string;
}

const NETWORK_CONFIGS: Record<number, TokenForgeConfig> = {
  1: {
    contractAddress: "0x1234567890123456789012345678901234567890" as Address, // Mainnet
    chainId: 1,
    networkName: "Ethereum Mainnet",
  },
  5: {
    contractAddress: "0x2345678901234567890123456789012345678901" as Address, // Goerli
    chainId: 5,
    networkName: "Goerli Testnet",
  },
};

const DEFAULT_CONFIG = NETWORK_CONFIGS[1];

export const useTokenForgeConfig = (): TokenForgeConfig => {
  const client = usePublicClient();
  const chainId = client?.chain?.id ?? DEFAULT_CONFIG.chainId;

  return NETWORK_CONFIGS[chainId] || DEFAULT_CONFIG;
};
