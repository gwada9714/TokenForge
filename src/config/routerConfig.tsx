import { lazy, Suspense } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import LoadingComponent from '../components/common/LoadingComponent';

// Configure future flags for React Router v7
export const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
} as const;

// Lazy load pages
const StakingPage = lazy(() => import('../pages/Staking'));
const LaunchpadPage = lazy(() => import('../pages/Launchpad'));
const TokensPage = lazy(() => import('../pages/Tokens'));
const CreateTokenPage = lazy(() => import('../pages/CreateToken'));

// Define routes configuration
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/staking" replace />
  },
  {
    path: '/staking',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <StakingPage />
      </Suspense>
    )
  },
  {
    path: '/launchpad',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <LaunchpadPage />
      </Suspense>
    )
  },
  {
    path: '/tokens',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <TokensPage />
      </Suspense>
    )
  },
  {
    path: '/tokens/create',
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <CreateTokenPage />
      </Suspense>
    )
  }
];
