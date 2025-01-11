export const TEST_WALLET_ADDRESS = '0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A' as const;

export const DEFAULT_TOKEN_CONFIG = {
  name: 'Test Token',
  symbol: 'TEST',
  decimals: 18,
  initialSupply: '1000000',
};

export const CHAIN_EXPLORER_URLS = {
  1: 'https://etherscan.io',
  11155111: 'https://sepolia.etherscan.io',
} as const;

// Temps d'attente entre les vérifications de statut de transaction (en ms)
export const TX_POLLING_INTERVAL = 5000;

// Nombre de confirmations requis pour considérer une transaction comme finalisée
export const REQUIRED_CONFIRMATIONS = {
  1: 3, // mainnet
  11155111: 1, // sepolia
} as const;
