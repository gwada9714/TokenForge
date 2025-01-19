import { useAccount } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { Address } from 'viem';
import { useContract } from '@/providers/contract';

interface AdminStatus {
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useAdminStatus = () => {
  const { address } = useAccount();
  const { contracts } = useContract();
  const [adminStatus, setAdminStatus] = useState<AdminStatus>({
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  const checkAdminStatus = useCallback(async (userAddress: Address) => {
    if (!userAddress) {
      setAdminStatus({
        isAdmin: false,
        isLoading: false,
        error: new Error('No wallet connected'),
      });
      return;
    }

    try {
      // Vérifier si l'utilisateur est admin sur au moins un contrat
      const isAdmin = contracts.some(contract => 
        contract.owner.toLowerCase() === userAddress.toLowerCase()
      );

      setAdminStatus({
        isAdmin,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAdminStatus({
        isAdmin: false,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to check admin status'),
      });
    }
  }, [contracts]);

  useEffect(() => {
    if (address) {
      checkAdminStatus(address);
    }
  }, [address, checkAdminStatus]);

  return adminStatus;
};

export default useAdminStatus;
