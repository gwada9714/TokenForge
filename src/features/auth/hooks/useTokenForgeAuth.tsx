import { useContext } from 'react';
import { TokenForgeAuthContext } from '../providers/TokenForgeAuthProvider';
import { logger } from '@/core/logger';

/**
 * Hook personnalisé qui expose les fonctionnalités d'authentification TokenForge
 * Ce hook doit être utilisé dans les composants enfants du TokenForgeAuthProvider
 */
export const useTokenForgeAuth = () => {
  const context = useContext(TokenForgeAuthContext);
  
  if (!context) {
    const errorMessage = 'useTokenForgeAuth doit être utilisé à l\'intérieur d\'un TokenForgeAuthProvider';
    logger.error({
      category: 'Auth',
      message: errorMessage,
      error: new Error(errorMessage)
    });
    throw new Error(errorMessage);
  }
  
  return context;
};

export default useTokenForgeAuth;
