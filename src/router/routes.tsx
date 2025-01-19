import { lazy } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AppLayout } from '../components/common/Layout/AppLayout';
import ProtectedRoute from '../routes/guards/ProtectedRoute';
import { adminRoutes } from './adminRoutes';

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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout><Outlet /></AppLayout>,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'login',
        element: <LoginForm />
      },
      {
        path: 'signup',
        element: <SignUpForm />
      },
      {
        path: 'unauthorized',
        element: <Unauthorized />
      },
      {
        path: 'create',
        element: <ProtectedRoute><TokenWizard /></ProtectedRoute>
      },
      {
        path: 'staking',
        element: <ProtectedRoute><StakingDashboard /></ProtectedRoute>
      },
      {
        path: 'profit',
        element: <ProtectedRoute><ProfitDashboard /></ProtectedRoute>
      },
      {
        path: 'launchpad',
        element: <LaunchpadPage />
      },
      {
        path: 'my-tokens',
        element: <ProtectedRoute><MyTokens /></ProtectedRoute>
      },
      {
        path: 'pricing',
        element: <Pricing />
      },
      adminRoutes
    ]
  }
]);

export default router;
