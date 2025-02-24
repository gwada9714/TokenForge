import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { AuthGuard } from '@/guards/AuthGuard';
import { PublicGuard } from '@/guards/PublicGuard';
import { Layout } from '@/layouts/Layout';

// Lazy loading des pages
const Home = lazy(() => import('@/pages/Home'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));
const Auth = lazy(() => import('@/pages/Auth'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Documentation = lazy(() => import('@/pages/docs'));
const CreateToken = lazy(() => import('@/pages/CreateToken'));
const TokenList = lazy(() => import('@/pages/TokenList'));
const TokenDetails = lazy(() => import('@/pages/TokenDetails'));
const Services = lazy(() => import('@/pages/Services'));
const Staking = lazy(() => import('@/pages/Staking'));
const Plans = lazy(() => import('@/pages/Plans'));
const ServiceConfiguration = lazy(() => import('@/pages/ServiceConfiguration'));

// Pages de configuration des services
const LaunchpadConfig = lazy(() => import('@/features/services/pages/LaunchpadConfig'));
const StakingConfig = lazy(() => import('@/features/services/pages/StakingConfig'));
const MarketingConfig = lazy(() => import('@/features/services/pages/MarketingConfig'));
const KYCConfig = lazy(() => import('@/features/services/pages/KYCConfig'));

// Configuration des routes
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'dashboard',
        element: (
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        ),
      },
      {
        path: 'plans',
        element: <Plans />,
      },
      {
        path: 'create-token',
        element: (
          <AuthGuard>
            <CreateToken />
          </AuthGuard>
        ),
      },
      {
        path: 'tokens',
        element: (
          <AuthGuard>
            <TokenList />
          </AuthGuard>
        ),
      },
      {
        path: 'tokens/:id',
        element: (
          <AuthGuard>
            <TokenDetails />
          </AuthGuard>
        ),
      },
      {
        path: 'services',
        element: <Services />,
      },
      {
        path: 'services/launchpad/config',
        element: <LaunchpadConfig />,
      },
      {
        path: 'services/staking/config',
        element: <StakingConfig />,
      },
      {
        path: 'services/marketing/config',
        element: <MarketingConfig />,
      },
      {
        path: 'services/kyc/config',
        element: <KYCConfig />,
      },
      {
        path: 'staking',
        element: (
          <AuthGuard>
            <Staking />
          </AuthGuard>
        ),
      },
      {
        path: 'docs',
        element: <Documentation />,
      },
      {
        path: 'auth',
        element: (
          <PublicGuard>
            <Auth />
          </PublicGuard>
        ),
      },
      {
        path: 'service-configuration',
        element: (
          <AuthGuard>
            <ServiceConfiguration />
          </AuthGuard>
        ),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];

// Types
export interface RouteConfig {
  path: string;
  title: string;
  icon?: string;
  isProtected?: boolean;
  isPublic?: boolean;
}

// Configuration des routes pour la navigation
export const navigationRoutes: RouteConfig[] = [
  {
    path: '/',
    title: 'Accueil',
    isPublic: true,
  },
  {
    path: '/plans',
    title: 'Plans & Tarifs',
    isPublic: true,
  },
  {
    path: '/dashboard',
    title: 'Tableau de bord',
    isProtected: true,
  },
  {
    path: '/create-token',
    title: 'Créer un Token',
    isProtected: true,
  },
  {
    path: '/tokens',
    title: 'Mes Tokens',
    isProtected: true,
  },
  {
    path: '/services',
    title: 'Services',
    isPublic: true,
  },
  {
    path: '/staking',
    title: 'Staking',
    isProtected: true,
  },
  {
    path: '/docs',
    title: 'Documentation',
    isPublic: true,
  },
]; 