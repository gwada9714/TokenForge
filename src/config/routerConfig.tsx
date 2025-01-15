import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import LoadingComponent from '../components/common/LoadingComponent';

// Configure future flags for React Router v7
export const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
} as const;

// Lazy load pages
const StakingPage = lazy(() => import('../pages/Staking').then(module => ({ default: module.StakingPage })));
const LaunchpadPage = lazy(() => import('../pages/Launchpad').then(module => ({ default: module.LaunchpadPage })));

// Define routes configuration
export const routes: RouteObject[] = [
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
  }
];
