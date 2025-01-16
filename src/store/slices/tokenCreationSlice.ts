import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenCreationState } from '../types';
import { TokenConfig } from '@/types/token';
import { TaxService } from '@/core/services/TaxService';
import { NetworkConfig } from '@/config/networks';

const initialState: TokenCreationState = {
  currentStep: 0,
  tokenConfig: {
    name: '',
    symbol: '',
    supply: '0',
    decimals: 18,
    features: [],
    plan: 'basic',
    taxConfig: TaxService.getDefaultTaxConfig(),
    maxLimits: {
      maxWallet: {
        enabled: false,
        amount: '0',
        percentage: 2,
      },
      maxTransaction: {
        enabled: false,
        amount: '0',
        percentage: 1,
      }
    },
    liquidityLock: {
      enabled: false,
      amount: '50',
      duration: 180 * 24 * 60 * 60,
      unlockDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      pair: '',
      dex: 'uniswap'
    }
  },
  isDeploying: false,
  deploymentError: null,
  deploymentStatus: null
};

const tokenCreationSlice = createSlice({
  name: 'tokenCreation',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateTokenConfig: (state, action: PayloadAction<Partial<TokenConfig>>) => {
      state.tokenConfig = {
        ...state.tokenConfig,
        ...action.payload
      };
    },
    setNetwork: (state, action: PayloadAction<NetworkConfig>) => {
      state.tokenConfig.network = action.payload;
    },
    setDeploymentStatus: (state, action: PayloadAction<TokenCreationState['deploymentStatus']>) => {
      state.deploymentStatus = action.payload;
    },
    startDeployment: (state) => {
      state.isDeploying = true;
      state.deploymentError = null;
    },
    deploymentSuccess: (state) => {
      state.isDeploying = false;
      state.deploymentStatus = null;
    },
    deploymentError: (state, action: PayloadAction<string>) => {
      state.isDeploying = false;
      state.deploymentError = action.payload;
    },
    resetTokenCreation: () => initialState
  }
});

export const {
  setCurrentStep,
  updateTokenConfig,
  setNetwork,
  setDeploymentStatus,
  startDeployment,
  deploymentSuccess,
  deploymentError,
  resetTokenCreation
} = tokenCreationSlice.actions;

export default tokenCreationSlice.reducer;
