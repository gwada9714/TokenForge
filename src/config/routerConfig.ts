import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import React from 'react';
import LoadingComponent from '../components/common/LoadingComponent';

import type { RouteObject } from 'react-router-dom';

// Lazy load pages
const StakingPage = lazy(() => import('../pages/Staking').then(module => ({ default: module.StakingPage })));
const LaunchpadPage = lazy(() => import('../pages/Launchpad').then(module => ({ default: module.LaunchpadPage })));

// Configure future flags for React Router v7
export const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

// Export routes configuration
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

const RouterConfig = () => {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
};

export default RouterConfig;
