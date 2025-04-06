import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TokenConfig } from "@/types/token";
import { TaxService } from "@/core/services/TaxService";
import { NetworkConfig } from "@/config/networks";
import { Draft } from "@reduxjs/toolkit";

// Fonction utilitaire pour convertir les tableaux readonly en mutables
function deepCopyRpcUrls(rpcUrls: any): any {
  const result: any = {};

  for (const key in rpcUrls) {
    if (typeof rpcUrls[key] === "object" && rpcUrls[key] !== null) {
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
  name: "",
  symbol: "",
  decimals: 18,
  supply: "",
  features: [],
  plan: "basic",
  taxConfig: {
    enabled: false,
    buyTax: 0,
    sellTax: 0,
    transferTax: 0,
    forgeShare: 0,
    redistributionShare: 0,
    liquidityShare: 0,
    burnShare: 0,
    recipient: "",
    distribution: {
      treasury: 60,
      development: 20,
      buyback: 15,
      staking: 5,
    },
  },
  liquidityLock: {
    enabled: false,
    amount: "0",
    unlockDate: Date.now() + 180 * 24 * 60 * 60 * 1000,
    beneficiary: "",
  },
  audit: {
    timestamp: null,
    status: "pending",
    issues: [],
    score: 0,
  },
  deploymentStatus: {
    status: "pending",
    txHash: "",
    contractAddress: "",
    error: "",
    deployedAt: undefined,
  },
};

const tokenCreationSlice = createSlice({
  name: "tokenCreation",
  initialState,
  reducers: {
    updateTokenConfig(state, action: PayloadAction<Partial<TokenConfig>>) {
      Object.assign(state, action.payload);
    },
    resetTokenConfig(state) {
      Object.assign(state, initialState);
    },
    setNetwork(state, action: PayloadAction<NetworkConfig>) {
      const network = action.payload;

      // Create a deep copy of the network configuration with mutable arrays
      const mutableNetwork = {
        ...network,
        chain: {
          ...network.chain,
          rpcUrls: {
            ...network.chain.rpcUrls,
            default: {
              ...network.chain.rpcUrls.default,
              http: Array.from(network.chain.rpcUrls.default.http),
              webSocket: network.chain.rpcUrls.default.webSocket
                ? Array.from(network.chain.rpcUrls.default.webSocket)
                : undefined,
            },
            public: {
              ...network.chain.rpcUrls.public,
              http: Array.from(network.chain.rpcUrls.public.http),
              webSocket: network.chain.rpcUrls.public.webSocket
                ? Array.from(network.chain.rpcUrls.public.webSocket)
                : undefined,
            },
          },
        },
      };

      state.network = mutableNetwork;
    },
    startDeployment(state) {
      if (state.deploymentStatus) {
        state.deploymentStatus.status = "deploying";
        state.deploymentStatus.error = undefined;
      }
    },
    deploymentSuccess(
      state,
      action: PayloadAction<{ txHash: string; contractAddress: string }>
    ) {
      if (state.deploymentStatus) {
        state.deploymentStatus.status = "success";
        state.deploymentStatus.txHash = action.payload.txHash;
        state.deploymentStatus.contractAddress = action.payload.contractAddress;
        state.deploymentStatus.deployedAt = Date.now();
      }
    },
    deploymentError(state, action: PayloadAction<string>) {
      if (state.deploymentStatus) {
        state.deploymentStatus.status = "failed";
        state.deploymentStatus.error = action.payload;
      }
    },
    setDeploymentStatus(
      state,
      action: PayloadAction<"pending" | "deploying" | "success" | "failed">
    ) {
      if (state.deploymentStatus) {
        state.deploymentStatus.status = action.payload;
      }
    },
  },
});

export const {
  updateTokenConfig,
  resetTokenConfig,
  setNetwork,
  startDeployment,
  deploymentSuccess,
  deploymentError,
  setDeploymentStatus,
} = tokenCreationSlice.actions;

export default tokenCreationSlice.reducer;
