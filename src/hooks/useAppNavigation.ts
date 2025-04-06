import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWeb3 } from "../contexts/Web3Context";
import { isProtectedRoute, requiresAdmin } from "../config/routes";

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, isCorrectNetwork, network } = useWeb3();

  const canAccess = useCallback(
    (path: string): boolean => {
      const needsProtection = isProtectedRoute(path);
      const needsAdmin = requiresAdmin(path);

      if (!needsProtection) return true;
      if (!isConnected) return false;
      if (!isCorrectNetwork) return false;
      if (needsAdmin && !network.isSupported) return false;

      return true;
    },
    [isConnected, isCorrectNetwork, network.isSupported]
  );

  const navigateTo = useCallback(
    (path: string) => {
      if (canAccess(path)) {
        navigate(path);
      } else {
        // Sauvegarder la destination souhaitée pour y retourner après connexion
        navigate("/", { state: { from: path } });
      }
    },
    [navigate, canAccess]
  );

  const getRedirectPath = useCallback((): string => {
    const state = location.state as { from?: string };
    if (state?.from && canAccess(state.from)) {
      return state.from;
    }
    return "/";
  }, [location.state, canAccess]);

  return {
    navigateTo,
    canAccess,
    getRedirectPath,
  };
};
