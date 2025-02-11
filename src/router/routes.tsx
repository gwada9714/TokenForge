import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import Layout from "@/components/layouts/main/Layout";
import { AdminRoute } from "@/features/auth/components/AdminRoute";
import { ProtectedRoute } from './guards/ProtectedRoute';
import LoadingScreen from '@/components/common/LoadingScreen';

// Lazy loading with named exports
const HomePage = lazy(() => import("@/features/home/pages/HomePage").then(module => ({ default: module.HomePage })));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage").then(module => ({ default: module.LoginPage })));
const SignUpPage = lazy(() => import("@/features/auth/pages/SignUpPage").then(module => ({ default: module.SignUpPage })));
const UnauthorizedPage = lazy(() => import("@/features/auth/pages/UnauthorizedPage").then(module => ({ default: module.UnauthorizedPage })));
const ConnectWalletPage = lazy(() => import("@/features/wallet/pages/ConnectWalletPage").then(module => ({ default: module.ConnectWalletPage })));
const WrongNetworkPage = lazy(() => import("@/features/wallet/pages/WrongNetworkPage").then(module => ({ default: module.WrongNetworkPage })));
const DashboardLayout = lazy(() => import("@/components/layouts/dashboard/DashboardLayout").then(module => ({ default: module.DashboardLayout })));
const DashboardHome = lazy(() => import("@/features/dashboard/components/DashboardHome").then(module => ({ default: module.DashboardHome })));
const AdminDashboard = lazy(() => import("@/features/admin/components/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const TokenCreationPage = lazy(() => import("@/features/token/pages/TokenCreationPage").then(module => ({ default: module.TokenCreationPage })));
const TokenPreviewPage = lazy(() => import("@/features/token/pages/TokenPreviewPage").then(module => ({ default: module.TokenPreviewPage })));
const ServicesPage = lazy(() => import("@/features/services/pages/ServicesPage").then(module => ({ default: module.ServicesPage })));

// Configure future flags for React Router v7
export const future = {
  v7_normalizeFormMethod: true,
  v7_prependBasename: true,
};

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      // Public Routes
      { index: true, element: withSuspense(HomePage) },
      { path: 'login', element: withSuspense(LoginPage) },
      { path: 'signup', element: withSuspense(SignUpPage) },
      { path: 'unauthorized', element: withSuspense(UnauthorizedPage) },
      { path: 'connect-wallet', element: withSuspense(ConnectWalletPage) },
      { path: 'wrong-network', element: withSuspense(WrongNetworkPage) },
      
      // Token Creation Routes
      {
        path: 'create',
        element: <ProtectedRoute>{withSuspense(TokenCreationPage)}</ProtectedRoute>,
      },
      {
        path: 'preview/:tokenId',
        element: <ProtectedRoute>{withSuspense(TokenPreviewPage)}</ProtectedRoute>,
      },
      
      // Services Routes
      {
        path: 'services',
        element: withSuspense(ServicesPage),
      },
      
      // Protected Dashboard Routes
      {
        path: 'dashboard',
        element: <ProtectedRoute>{withSuspense(DashboardLayout)}</ProtectedRoute>,
        children: [
          { index: true, element: withSuspense(DashboardHome) },
          { path: 'tokens', element: withSuspense(lazy(() => import("@/features/token/pages/TokenListPage").then(module => ({ default: module.TokenListPage })))) },
          { path: 'analytics', element: withSuspense(lazy(() => import("@/features/analytics/pages/AnalyticsPage").then(module => ({ default: module.AnalyticsPage })))) }
        ]
      },
      
      // Admin Routes
      {
        path: 'admin',
        element: <AdminRoute>{withSuspense(AdminDashboard)}</AdminRoute>,
        children: [
          { path: 'users', element: withSuspense(lazy(() => import("@/features/admin/pages/UsersManagementPage").then(module => ({ default: module.UsersManagementPage })))) },
          { path: 'tokens', element: withSuspense(lazy(() => import("@/features/admin/pages/TokensManagementPage").then(module => ({ default: module.TokensManagementPage })))) }
        ]
      }
    ]
  }
];

export const router = createBrowserRouter(routes, { future });
