import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout';
import { LoadingFallback } from '../components/LoadingFallback';
import { AdminRoute } from '../guards/AdminRoute';
import AdminLayout from '../../components/layouts/AdminLayout';

// Lazy loading components
const HomePage = lazy(() => import('../../pages/Home'));
const TokenWizard = lazy(() => import('../../components/TokenWizard/TokenWizard'));
const StakingDashboard = lazy(() => import('../../components/Staking/StakingDashboard'));
const ProfitDashboard = lazy(() => import('../../components/Dashboard/ProfitDashboard'));
const LaunchpadPage = lazy(() => import('../../pages/Launchpad'));
const MyTokens = lazy(() => import('../../pages/MyTokens'));
const Pricing = lazy(() => import('../../pages/Pricing'));

// Admin Pages
const AdminDashboard = lazy(() => import('../../pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('../../pages/admin/Users'));
const AdminTokens = lazy(() => import('../../pages/admin/Tokens'));
const AdminServices = lazy(() => import('../../pages/admin/Services'));
const AdminLogs = lazy(() => import('../../pages/admin/Logs'));

// Service Pages
const LaunchpadService = lazy(() => import('../../pages/services/Launchpad'));
const StakingService = lazy(() => import('../../pages/services/Staking'));
const MarketingService = lazy(() => import('../../pages/services/Marketing'));
const KYCService = lazy(() => import('../../pages/services/KYC'));

// Token Pages
const TokenStaking = lazy(() => import('../../pages/token/Staking'));
const TokenInfo = lazy(() => import('../../pages/token/Info'));

const wrapInSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const wrapInAdminLayout = (Component: React.ComponentType) => (
  <AdminRoute>
    <AdminLayout>
      {wrapInSuspense(Component)}
    </AdminLayout>
  </AdminRoute>
);

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: wrapInSuspense(HomePage)
      },
      {
        path: 'create',
        element: wrapInSuspense(TokenWizard)
      },
      {
        path: 'staking',
        element: wrapInSuspense(StakingDashboard)
      },
      {
        path: 'dashboard',
        element: wrapInSuspense(ProfitDashboard)
      },
      {
        path: 'launchpad',
        element: wrapInSuspense(LaunchpadPage)
      },
      {
        path: 'my-tokens',
        element: wrapInSuspense(MyTokens)
      },
      {
        path: 'pricing',
        element: wrapInSuspense(Pricing)
      }
    ]
  },
  // Admin Routes
  {
    path: 'admin',
    children: [
      {
        index: true,
        element: wrapInAdminLayout(AdminDashboard)
      },
      {
        path: 'users',
        element: wrapInAdminLayout(AdminUsers)
      },
      {
        path: 'tokens',
        element: wrapInAdminLayout(AdminTokens)
      },
      {
        path: 'services',
        element: wrapInAdminLayout(AdminServices)
      },
      {
        path: 'logs',
        element: wrapInAdminLayout(AdminLogs)
      }
    ]
  },
  // Service Routes
  {
    path: 'services',
    children: [
      {
        path: 'launchpad',
        element: wrapInSuspense(LaunchpadService)
      },
      {
        path: 'staking',
        element: wrapInSuspense(StakingService)
      },
      {
        path: 'marketing',
        element: wrapInSuspense(MarketingService)
      },
      {
        path: 'kyc',
        element: wrapInSuspense(KYCService)
      }
    ]
  },
  // Token Routes
  {
    path: 'token',
    children: [
      {
        path: 'staking',
        element: wrapInSuspense(TokenStaking)
      },
      {
        path: 'info',
        element: wrapInSuspense(TokenInfo)
      }
    ]
  }
];
