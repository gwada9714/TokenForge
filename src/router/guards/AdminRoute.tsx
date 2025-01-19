import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { RootState } from '../../store/types';

/**
 * Guard pour les routes d'administration.
 * Vérifie que l'utilisateur est authentifié et a les droits d'administrateur.
 *
 * @component
 * @example
 * ```tsx
 * <AdminRoute>
 *   <AdminDashboard />
 * </AdminRoute>
 * ```
 *
 * @param {object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Les composants enfants à protéger
 *
 * @remarks
 * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié,
 * ou vers la page "unauthorized" s'il n'a pas les droits d'administrateur.
 */
interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdmin, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
