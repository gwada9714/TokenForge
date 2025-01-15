import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import React from 'react';

const StakingPage = lazy(() => import('../pages/Staking').then(module => ({ default: module.StakingPage })));
const LaunchpadPage = lazy(() => import('../pages/Launchpad').then(module => ({ default: module.LaunchpadPage })));

// Configure future flags for React Router v7
export const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

export const RouterConfig: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/staking" element={<Suspense fallback={<div>Loading...</div>}><StakingPage /></Suspense>} />
      <Route path="/launchpad" element={<Suspense fallback={<div>Loading...</div>}><LaunchpadPage /></Suspense>} />
    </Routes>
  </BrowserRouter>
);
