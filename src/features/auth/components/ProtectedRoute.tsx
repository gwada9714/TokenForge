import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTokenForgeAuthContext } from "../context/TokenForgeAuthProvider";
import { CircularProgress, Box } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireWallet?: boolean;
  requireCorrectNetwork?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireWallet = false,
  requireCorrectNetwork = false,
}) => {
  const { isAuthenticated, loading, isConnected, isCorrectNetwork } =
    useTokenForgeAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireWallet && !isConnected) {
    return <Navigate to="/connect-wallet" state={{ from: location }} replace />;
  }

  if (requireCorrectNetwork && !isCorrectNetwork) {
    return <Navigate to="/wrong-network" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
