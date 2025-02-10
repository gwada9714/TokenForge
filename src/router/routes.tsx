import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import Layout from "@/components/layouts/main/Layout";
import { AdminRoute } from "@/features/auth/components/AdminRoute";
import { AdminDashboard } from "@/features/admin/components/AdminDashboard";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignUpPage } from "@/features/auth/pages/SignUpPage";
import { UnauthorizedPage } from "@/features/auth/pages/UnauthorizedPage";
import { ConnectWalletPage } from "@/features/wallet/pages/ConnectWalletPage";
import { WrongNetworkPage } from "@/features/wallet/pages/WrongNetworkPage";
import { DashboardLayout } from "@/components/layouts/dashboard/DashboardLayout";
import { ProtectedRoute } from './guards/ProtectedRoute';
import { DashboardHome } from "@/features/dashboard/components/DashboardHome";

// Configure future flags for React Router v7
export const future = {
  v7_normalizeFormMethod: true,
  v7_prependBasename: true,
};

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      // Public Routes
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignUpPage /> },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { path: 'connect-wallet', element: <ConnectWalletPage /> },
      { path: 'wrong-network', element: <WrongNetworkPage /> },
      
      // Protected Routes
      {
        path: 'dashboard',
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <DashboardHome /> }
        ]
      },
      
      // Admin Routes
      {
        path: 'admin',
        element: <AdminRoute><AdminDashboard /></AdminRoute>
      }
    ]
  }
];

// Configure browser router with all routes
export const router = createBrowserRouter(routes);
