import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTokenForgeAuthContext } from '../context/TokenForgeAuthProvider';
import { ProtectedRoute } from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
  requireWallet?: boolean;
  requireCorrectNetwork?: boolean;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  requireWallet = true,
  requireCorrectNetwork = true,
}) => {
  const { isAdmin } = useTokenForgeAuthContext();
  const location = useLocation();

  return (
    <ProtectedRoute requireWallet={requireWallet} requireCorrectNetwork={requireCorrectNetwork}>
      {isAdmin ? (
        children
      ) : (
        <Navigate to="/unauthorized" state={{ from: location }} replace />
      )}
    </ProtectedRoute>
  );
};
