import { lazy, Suspense } from 'react';
import { CircularProgress } from '@mui/material';
import AdminLayout from '../components/layouts/AdminLayout';
import AdminRoute from '../components/auth/AdminRoute';

// Lazy loading components
const HomePage = lazy(() => import('../pages/Home'));
const TokenWizard = lazy(() => import('../components/TokenWizard/TokenWizard'));
const StakingDashboard = lazy(() => import('../components/Staking/StakingDashboard'));
const ProfitDashboard = lazy(() => import('../components/Dashboard/ProfitDashboard'));
const LaunchpadPage = lazy(() => import('../pages/Launchpad'));
const MyTokens = lazy(() => import('../pages/MyTokens'));
const Pricing = lazy(() => import('../pages/Pricing'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminTokens = lazy(() => import('../pages/admin/Tokens'));
const AdminServices = lazy(() => import('../pages/admin/Services'));
const AdminLogs = lazy(() => import('../pages/admin/Logs'));

// Service Pages
const LaunchpadService = lazy(() => import('../pages/services/Launchpad'));
const StakingService = lazy(() => import('../pages/services/Staking'));
const MarketingService = lazy(() => import('../pages/services/Marketing'));
const KYCService = lazy(() => import('../pages/services/KYC'));

// Token Pages
const TokenStaking = lazy(() => import('../pages/token/Staking'));
const TokenInfo = lazy(() => import('../pages/token/Info'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <CircularProgress className="text-primary" />
  </div>
);

// Route configuration with performance optimization
export const routes = [
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: '/create',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TokenWizard />
      </Suspense>
    ),
  },
  {
    path: '/staking',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <StakingDashboard />
      </Suspense>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProfitDashboard />
      </Suspense>
    ),
  },
  {
    path: '/launchpad',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LaunchpadPage />
      </Suspense>
    ),
  },
  {
    path: '/my-tokens',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <MyTokens />
      </Suspense>
    ),
  },
  {
    path: '/pricing',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Pricing />
      </Suspense>
    ),
  },
  // Admin Routes
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout>
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard />
          </Suspense>
        </AdminLayout>
      </AdminRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <AdminRoute>
        <AdminLayout>
          <Suspense fallback={<LoadingFallback />}>
            <AdminUsers />
          </Suspense>
        </AdminLayout>
      </AdminRoute>
    ),
  },
  {
    path: '/admin/tokens',
    element: (
      <AdminRoute>
        <AdminLayout>
          <Suspense fallback={<LoadingFallback />}>
            <AdminTokens />
          </Suspense>
        </AdminLayout>
      </AdminRoute>
    ),
  },
  {
    path: '/admin/services',
    element: (
      <AdminRoute>
        <AdminLayout>
          <Suspense fallback={<LoadingFallback />}>
            <AdminServices />
          </Suspense>
        </AdminLayout>
      </AdminRoute>
    ),
  },
  {
    path: '/admin/logs',
    element: (
      <AdminRoute>
        <AdminLayout>
          <Suspense fallback={<LoadingFallback />}>
            <AdminLogs />
          </Suspense>
        </AdminLayout>
      </AdminRoute>
    ),
  },
  // Service Routes
  {
    path: '/services/launchpad',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LaunchpadService />
      </Suspense>
    ),
  },
  {
    path: '/services/staking',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <StakingService />
      </Suspense>
    ),
  },
  {
    path: '/services/marketing',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <MarketingService />
      </Suspense>
    ),
  },
  {
    path: '/services/kyc',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <KYCService />
      </Suspense>
    ),
  },
  // Token Routes
  {
    path: '/token/staking',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TokenStaking />
      </Suspense>
    ),
  },
  {
    path: '/token/info',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TokenInfo />
      </Suspense>
    ),
  },
];
