import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AppLayout } from '../components/common/Layout/AppLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import { adminRoutes } from './adminRoutes';
import LoadingFallback from '../components/common/LoadingFallback';

// Configure future flags for React Router v7
export const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
} as const;

// Lazy loading des composants
const HomePage = lazy(() => import('../pages/Home'));
const LoginForm = lazy(() => import('../components/auth/LoginForm').then(module => ({ default: module.default || module.LoginForm })));
const SignUpForm = lazy(() => import('../components/auth/SignUpForm').then(module => ({ default: module.default || module.SignUpForm })));
const TokenWizard = lazy(() => import('../components/TokenWizard/TokenWizard'));
const StakingDashboard = lazy(() => import('../components/Staking/StakingDashboard'));
const ProfitDashboard = lazy(() => import('../components/Dashboard/ProfitDashboard'));
const LaunchpadPage = lazy(() => import('../pages/Launchpad'));
const MyTokens = lazy(() => import('../pages/MyTokens'));
const Pricing = lazy(() => import('../pages/Pricing'));
const NotFound = lazy(() => import('../pages/errors/NotFound'));
const Unauthorized = lazy(() => import('../pages/errors/Unauthorized'));

// Wrapper pour les composants lazy-loadés
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout><Outlet /></AppLayout>,
    errorElement: <LazyWrapper><NotFound /></LazyWrapper>,
    children: [
      {
        index: true,
        element: <LazyWrapper><HomePage /></LazyWrapper>
      },
      {
        path: 'login',
        element: <LazyWrapper><LoginForm /></LazyWrapper>
      },
      {
        path: 'signup',
        element: <LazyWrapper><SignUpForm /></LazyWrapper>
      },
      {
        path: 'unauthorized',
        element: <LazyWrapper><Unauthorized /></LazyWrapper>
      },
      {
        path: 'create',
        element: <ProtectedRoute><LazyWrapper><TokenWizard /></LazyWrapper></ProtectedRoute>
      },
      {
        path: 'staking',
        element: <ProtectedRoute><LazyWrapper><StakingDashboard /></LazyWrapper></ProtectedRoute>
      },
      {
        path: 'profit',
        element: <ProtectedRoute><LazyWrapper><ProfitDashboard /></LazyWrapper></ProtectedRoute>
      },
      {
        path: 'launchpad',
        element: <LazyWrapper><LaunchpadPage /></LazyWrapper>
      },
      {
        path: 'my-tokens',
        element: <ProtectedRoute><LazyWrapper><MyTokens /></LazyWrapper></ProtectedRoute>
      },
      {
        path: 'pricing',
        element: <LazyWrapper><Pricing /></LazyWrapper>
      },
      adminRoutes
    ]
  }
]);

export default router;
