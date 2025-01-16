import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenConfig } from '@/types/token';
import { TaxService } from '@/core/services/TaxService';
import { NetworkConfig } from '@/config/networks';
import { Draft } from '@reduxjs/toolkit';

// Fonction utilitaire pour convertir les tableaux readonly en mutables
function deepCopyRpcUrls(rpcUrls: any): any {
  const result: any = {};
  
  for (const key in rpcUrls) {
    if (typeof rpcUrls[key] === 'object' && rpcUrls[key] !== null) {
      if (Array.isArray(rpcUrls[key])) {
        result[key] = Array.from(rpcUrls[key]);
      } else {
        result[key] = deepCopyRpcUrls(rpcUrls[key]);
      }
    } else {
      result[key] = rpcUrls[key];
    }
  }
  
  return result;
}

const initialState: TokenConfig = {
  name: '',
  symbol: '',
  decimals: 18,
  supply: '',
  features: [],
  plan: 'basic',
  taxConfig: {
    enabled: false,
    baseTaxRate: 0.5,
    additionalTaxRate: 0,
    creatorWallet: '',
    distribution: {
      treasury: 60,
      development: 20,
      buyback: 15,
      staking: 5
    }
  },
  liquidityLock: {
    enabled: false,
    amount: '0',
    unlockDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
    beneficiary: ''
  },
  audit: {
    timestamp: null,
    status: 'pending',
    issues: [],
    score: 0
  }
};

const tokenCreationSlice = createSlice({
  name: 'tokenCreation',
  initialState,
  reducers: {
    updateTokenConfig: (state, action: PayloadAction<Partial<TokenConfig>>) => {
      Object.assign(state, action.payload);
    },
    resetTokenConfig: () => initialState,
    setNetwork: (state, action: PayloadAction<NetworkConfig>) => {
      const network = action.payload;
      
      // Créer une copie profonde de la configuration réseau avec des tableaux mutables
      state.network = {
        ...network,
        chain: {
          ...network.chain,
          rpcUrls: deepCopyRpcUrls(network.chain.rpcUrls)
        }
      };
    }
  }
});

export const { updateTokenConfig, resetTokenConfig, setNetwork } = tokenCreationSlice.actions;

export default tokenCreationSlice.reducer;
