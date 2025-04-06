import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTokenForgeAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface PublicGuardProps {
  children: React.ReactNode;
}

export function PublicGuard({ children }: PublicGuardProps) {
  const { isAuthenticated, loading: isLoading } = useTokenForgeAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    // Rediriger vers la page précédente ou le tableau de bord s'ils sont déjà authentifiés
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
