import { useContract } from '@/providers/contract';
import { useCallback } from 'react';
import { Address, Hash } from 'viem';

interface DeploymentStatus {
  status: 'pending' | 'success' | 'error';
  hash?: Hash;
  error?: string;
}

export const useTokenDeployment = () => {
  const { deploymentStatus, setDeploymentStatus } = useContract();

  const updateDeploymentStatus = useCallback((
    address: Address,
    status: DeploymentStatus
  ) => {
    setDeploymentStatus(address, status);
  }, [setDeploymentStatus]);

  const getDeploymentStatus = useCallback((
    address: Address
  ): DeploymentStatus | undefined => {
    return deploymentStatus[address];
  }, [deploymentStatus]);

  const isPending = useCallback((
    address: Address
  ): boolean => {
    return deploymentStatus[address]?.status === 'pending';
  }, [deploymentStatus]);

  const isSuccess = useCallback((
    address: Address
  ): boolean => {
    return deploymentStatus[address]?.status === 'success';
  }, [deploymentStatus]);

  const isError = useCallback((
    address: Address
  ): boolean => {
    return deploymentStatus[address]?.status === 'error';
  }, [deploymentStatus]);

  return {
    deploymentStatus,
    updateDeploymentStatus,
    getDeploymentStatus,
    isPending,
    isSuccess,
    isError,
  };
};

export default useTokenDeployment;
