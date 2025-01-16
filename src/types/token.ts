import { TaxConfig, LiquidityLock, MaxLimits, TokenAudit, KYCVerification } from './tokenFeatures';
import { NetworkConfig } from '@/config/networks';

// Réexporter les types pour les rendre disponibles
export { TaxConfig, LiquidityLock, MaxLimits, TokenAudit, KYCVerification };

export interface TokenConfig {
  // Configuration de base
  name: string;
  symbol: string;
  supply: string;
  decimals: number;
  
  // Réseau
  network?: NetworkConfig;
  
  // Fonctionnalités
  features: {
    burnable: boolean;
    mintable: boolean;
    pausable: boolean;
    blacklist: boolean;
    forceTransfer: boolean;
    deflation: boolean;
    reflection: boolean;
  };
  
  // Plan de service
  plan: string;
  
  // Configurations avancées
  taxConfig?: TaxConfig;
  liquidityLock?: {
    enabled: boolean;
    amount: string;
    unlockDate: number;
    beneficiary: string;
  };
  maxLimits?: MaxLimits;
  
  // Vérification et Audit
  audit?: TokenAudit;
  kyc?: KYCVerification;
  
  // Métadonnées
  description?: string;
  website?: string;
  telegram?: string;
  twitter?: string;
  github?: string;
  
  // État de déploiement
  deploymentStatus?: {
    status: 'pending' | 'deploying' | 'success' | 'failed';
    txHash?: string;
    error?: string;
    contractAddress?: string;
    deployedAt?: number;
  };
}

export interface TokenPlan {
  name: string;
  price: string;
  icon: any;
  features: string[];
  buttonText: string;
  value: string;
  isPopular?: boolean;
}
