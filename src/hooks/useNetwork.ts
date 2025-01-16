import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { NetworkConfig, networks } from '@/config/networks';

export function useNetwork() {
  const { chainId } = useWeb3React();
  const [network, setNetwork] = useState<NetworkConfig | null>(null);

  useEffect(() => {
    if (chainId && networks[chainId]) {
      setNetwork(networks[chainId]);
    } else {
      setNetwork(null);
    }
  }, [chainId]);

  return { network };
}
