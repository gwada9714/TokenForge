import { useAccount, useBalance, useEnsName } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { formatEther } from 'viem';

interface WalletStatus {
  address: string | undefined;
  ensName: string | null | undefined;
  balance: string;
  isConnected: boolean;
  shortAddress: string | undefined;
}

export const useWalletStatus = () => {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: balance } = useBalance({ address });
  const [walletStatus, setWalletStatus] = useState<WalletStatus>({
    address: undefined,
    ensName: undefined,
    balance: '0',
    isConnected: false,
    shortAddress: undefined,
  });

  const formatBalance = useCallback((rawBalance: bigint | undefined): string => {
    if (!rawBalance) return '0';
    return formatEther(rawBalance);
  }, []);

  const shortenAddress = useCallback((addr: string | undefined): string | undefined => {
    if (!addr) return undefined;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  useEffect(() => {
    setWalletStatus({
      address,
      ensName: ensName || undefined,
      balance: balance ? formatBalance(balance.value) : '0',
      isConnected,
      shortAddress: shortenAddress(address),
    });
  }, [address, ensName, balance, isConnected, formatBalance, shortenAddress]);

  return walletStatus;
};

export default useWalletStatus;
