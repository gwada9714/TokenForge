import { useChainId, useConfig } from "wagmi";
import type { Chain } from "wagmi/chains";
import { type NetworkConfig, networks } from "../../../config/networks";

interface NetworkHookResult {
  chain: Chain | undefined;
  chains: readonly Chain[];
  network: NetworkConfig | null;
}

export const useNetwork = (): NetworkHookResult => {
  const chainId = useChainId();
  const config = useConfig();

  const chain = config.chains.find((c: Chain) => c.id === chainId);
  const network: NetworkConfig | null = chainId ? networks[chainId] : null;

  return {
    chain,
    chains: config.chains,
    network,
  };
};
