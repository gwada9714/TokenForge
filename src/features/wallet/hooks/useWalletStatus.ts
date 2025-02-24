import { useTokenForgeAuth } from '@/features/auth/hooks/useTokenForgeAuth';

export const useWalletStatus = () => {
  const { state } = useTokenForgeAuth();
  
  // Ajout d'une valeur par défaut pour éviter l'erreur de destructuring
  const { wallet } = state ?? { wallet: null };
  
  const isConnected = Boolean(wallet?.address);
  const isCorrectNetwork = Boolean(wallet?.isCorrectNetwork);
  
  return {
    isConnected,
    isCorrectNetwork,
    address: wallet?.address,
  };
};
