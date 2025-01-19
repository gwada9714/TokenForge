import { useState } from 'react';
import { TokenConfig, TokenFeatures, TokenDeploymentStatus } from '../types';
import { DEFAULT_TOKEN_CONFIG } from '../constants';

export const useTokenCreation = () => {
  const [config, setConfig] = useState<TokenConfig>({
    name: '',
    symbol: '',
    decimals: DEFAULT_TOKEN_CONFIG.decimals,
    totalSupply: '',
  });

  const [features, setFeatures] = useState<TokenFeatures>(DEFAULT_TOKEN_CONFIG.features);
  const [deploymentStatus, setDeploymentStatus] = useState<TokenDeploymentStatus>({
    status: 'pending'
  });

  const updateConfig = (updates: Partial<TokenConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateFeatures = (updates: Partial<TokenFeatures>) => {
    setFeatures(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setConfig({
      name: '',
      symbol: '',
      decimals: DEFAULT_TOKEN_CONFIG.decimals,
      totalSupply: '',
    });
    setFeatures(DEFAULT_TOKEN_CONFIG.features);
    setDeploymentStatus({ status: 'pending' });
  };

  return {
    config,
    features,
    deploymentStatus,
    updateConfig,
    updateFeatures,
    setDeploymentStatus,
    resetForm,
  };
};
