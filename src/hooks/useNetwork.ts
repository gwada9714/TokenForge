import { useChainId, useConfig } from 'wagmi';
import { type NetworkConfig, networks } from '../config/networks';

export function useNetwork() {
  const chainId = useChainId();
  const config = useConfig();
  
  const chain = config.chains.find(c => c.id === chainId);
  const network: NetworkConfig | null = chainId ? networks[chainId] : null;

  return { 
    chain,
    chains: config.chains,
    network 
  };
}
