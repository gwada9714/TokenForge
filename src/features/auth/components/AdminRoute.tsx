import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTokenForgeAuth } from '../hooks/useTokenForgeAuth';
import { ProtectedRoute } from './ProtectedRoute';
import { notificationService } from '../services/notificationService';

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
  const { validateAdminAccess } = useTokenForgeAuth();
  const location = useLocation();

  const canAccess = validateAdminAccess();

  useEffect(() => {
    if (!canAccess) {
      notificationService.warning('Access denied: Admin privileges required');
    }
  }, [canAccess]);

  return (
    <ProtectedRoute requireWallet={requireWallet} requireCorrectNetwork={requireCorrectNetwork}>
      {canAccess ? (
        children
      ) : (
        <Navigate to="/unauthorized" state={{ from: location }} replace />
      )}
    </ProtectedRoute>
  );
};
