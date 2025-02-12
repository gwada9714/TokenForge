import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { useFirebaseAuth } from './features/auth/hooks/useFirebaseAuth';

// Components
const Login = React.lazy(() => import('./features/auth/components/Login'));
const Register = React.lazy(() => import('./features/auth/components/Register'));
const Dashboard = React.lazy(() => import('./features/dashboard/Dashboard'));
const Profile = React.lazy(() => import('./features/profile/Profile'));

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useFirebaseAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={<div>Chargement...</div>}>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </React.Suspense>
  );
};
