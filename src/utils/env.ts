// Utilitaire pour vérifier les variables d'environnement
export const checkEnvVariables = () => {
  console.log('Checking environment variables...');
  console.log('VITE_WALLET_CONNECT_PROJECT_ID:', import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID);
  console.log('VITE_ALCHEMY_API_KEY:', import.meta.env.VITE_ALCHEMY_API_KEY);
  console.log('VITE_MAINNET_RPC_URL:', import.meta.env.VITE_MAINNET_RPC_URL);
  console.log('VITE_SEPOLIA_RPC_URL:', import.meta.env.VITE_SEPOLIA_RPC_URL);
  
  // Vérifier si les variables sont définies
  const envVars = {
    projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
    alchemyId: import.meta.env.VITE_ALCHEMY_API_KEY,
    mainnetRpcUrl: import.meta.env.VITE_MAINNET_RPC_URL,
    sepoliaRpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL
  };

  return envVars;
};
