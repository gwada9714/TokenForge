import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWeb3Provider = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return;
    }

    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(browserProvider);

    browserProvider.getSigner()
      .then(newSigner => setSigner(newSigner))
      .catch(error => {
        console.error('Failed to get signer:', error);
        setSigner(null);
      });
  }, []);

  return { provider, signer };
}; 