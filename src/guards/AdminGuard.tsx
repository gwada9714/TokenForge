import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTokenForgeAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, user, loading: isLoading } = useTokenForgeAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Vérifier si l'utilisateur est authentifié et s'il a le rôle d'administrateur
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}