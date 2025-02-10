import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { RootState } from '../../store/types';
import { useWalletStatus } from '../../features/auth/hooks/useWalletStatus';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const { isConnected, isCorrectNetwork } = useWalletStatus();
  const location = useLocation();

  if (!isConnected) {
    return <Navigate to="/connect-wallet" state={{ from: location }} replace />;
  }

  if (!isCorrectNetwork) {
    return <Navigate to="/wrong-network" state={{ from: location }} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
