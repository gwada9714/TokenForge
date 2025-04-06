import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTokenForgeAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useTokenForgeAuth();
  const location = useLocation();

  if (isLoading) {
    // Vous pouvez ajouter un composant de chargement ici
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
