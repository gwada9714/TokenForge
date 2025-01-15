import React, { lazy, Suspense } from 'react';
import type { AppRoute } from '../types/router';
import { createRouteObject } from '../utils/route';
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
const routesConfig: AppRoute[] = [
  {
    path: '/staking',
    component: StakingPage
  },
  {
    path: '/launchpad',
    component: LaunchpadPage
  }
];

// Create route objects with proper typing
export const routes = routesConfig.map(createRouteObject);
