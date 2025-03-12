import { useContext } from 'react';
import { TokenForgeAuthContext } from '../providers/TokenForgeAuthProvider';
import { TokenForgeAuthContextValue } from '../types/auth';

/**
 * Hook pour accéder au contexte d'authentification TokenForge
 * Ce hook simplifié utilise directement le contexte fourni par TokenForgeAuthProvider
 * sans logique d'authentification dupliquée
 * 
 * @returns {TokenForgeAuthContextValue} Le contexte d'authentification avec toutes les méthodes et états
 * @throws {Error} Si utilisé en dehors d'un TokenForgeAuthProvider
 */
export function useTokenForgeAuth(): TokenForgeAuthContextValue {
  const context = useContext(TokenForgeAuthContext);
  
  if (context === undefined) {
    throw new Error('useTokenForgeAuth doit être utilisé à l\'intérieur d\'un TokenForgeAuthProvider');
  }
  
  return context;
}

export default useTokenForgeAuth;
