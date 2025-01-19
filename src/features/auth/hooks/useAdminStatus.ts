import { useTokenForgeAuthContext } from '../context/TokenForgeAuthProvider';

export const useAdminStatus = () => {
  const { isAdmin, isAuthenticated, isConnected, isCorrectNetwork } = useTokenForgeAuthContext();

  return {
    isAdmin,
    isAuthenticated,
    isConnected,
    isCorrectNetwork,
    canAccessAdmin: isAdmin && isAuthenticated && isConnected && isCorrectNetwork,
  };
};
