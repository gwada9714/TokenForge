// Utility to validate environment variables
const requiredEnvVars = {
  VITE_WALLET_CONNECT_PROJECT_ID: import.meta.env
    .VITE_WALLET_CONNECT_PROJECT_ID,
  VITE_TOKEN_FACTORY_ADDRESS: import.meta.env.VITE_TOKEN_FACTORY_ADDRESS,
  VITE_ETHERSCAN_API_KEY: import.meta.env.VITE_ETHERSCAN_API_KEY,
};

// Validate required environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const config = {
  walletConnect: {
    projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID as string,
  },
  contracts: {
    tokenFactory: import.meta.env.VITE_TOKEN_FACTORY_ADDRESS as `0x${string}`,
  },
  etherscan: {
    apiKey: import.meta.env.VITE_ETHERSCAN_API_KEY as string,
  },
  moonpay: {
    apiKey: import.meta.env.VITE_MOONPAY_API_KEY,
  },
  alchemy: {
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  },
  isDevelopment: import.meta.env.MODE === "development",
} as const;
