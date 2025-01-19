import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { CircularProgress } from '@mui/material';

interface AdminRouteProps {
  children: React.ReactNode;
}

const ADMIN_ADDRESSES = [
  // Add admin addresses here
  '0x1234567890123456789012345678901234567890',
] as const;

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { address, isConnecting } = useAccount();
  const location = useLocation();

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  const isAdmin = address && ADMIN_ADDRESSES.includes(address.toLowerCase() as (typeof ADMIN_ADDRESSES)[number]);

  if (!isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
