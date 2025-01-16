import { lazy, Suspense } from 'react';
import { CircularProgress } from '@mui/material';

// Lazy loading components
const HomePage = lazy(() => import('../pages/Home'));
const TokenWizard = lazy(() => import('../components/TokenWizard/TokenWizard'));
const StakingDashboard = lazy(() => import('../components/Staking/StakingDashboard'));
const ProfitDashboard = lazy(() => import('../components/Dashboard/ProfitDashboard'));
const LaunchpadPage = lazy(() => import('../pages/Launchpad'));
const MyTokens = lazy(() => import('../pages/MyTokens'));
const Pricing = lazy(() => import('../pages/Pricing'));

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
];
