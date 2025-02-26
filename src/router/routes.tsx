import React from 'react';
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { AuthGuard } from '@/guards/AuthGuard';
import { AdminGuard } from '@/guards/AdminGuard';
import { PublicGuard } from '@/guards/PublicGuard';
import { Layout } from '@/layouts/Layout';

// Lazy loading des pages
const Home = lazy(() => import('@/features/home/pages/HomePage').then(module => ({ default: module.HomePage })));
const Dashboard = lazy(() => import('@/features/dashboard/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const Profile = lazy(() => import('@/features/auth/pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const Auth = lazy(() => import('@/features/auth/pages/AuthPage').then(module => ({ default: module.AuthPage })));
const NotFound = lazy(() => import('@/features/common/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const Documentation = lazy(() => import('@/features/docs/pages/DocumentationPage').then(module => ({ default: module.DocumentationPage })));
const CreateToken = lazy(() => import('@/features/token/pages/CreateTokenPage').then(module => ({ default: module.CreateTokenPage })));
const TokenList = lazy(() => import('@/features/token/pages/TokenListPage').then(module => ({ default: module.TokenListPage })));
const TokenDetails = lazy(() => import('@/features/token/pages/TokenDetailsPage').then(module => ({ default: module.TokenDetailsPage })));
const Services = lazy(() => import('@/features/services/pages/ServicesPage').then(module => ({ default: module.ServicesPage })));
const Plans = lazy(() => import('@/features/pricing/pages/PlansPage').then(module => ({ default: module.PlansPage })));
const Learn = lazy(() => import('@/features/learn/pages/LearnPage').then(module => ({ default: module.LearnPage })));
const Blog = lazy(() => import('@/features/blog/pages/BlogPage').then(module => ({ default: module.BlogPage })));
const Partnership = lazy(() => import('@/features/partnership/pages/PartnershipPage').then(module => ({ default: module.PartnershipPage })));

// Pages admin
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));
const UsersManagement = lazy(() => import('@/features/admin/pages/UsersManagementPage').then(module => ({ default: module.UsersManagementPage })));
const TokensManagement = lazy(() => import('@/features/admin/pages/TokensManagementPage').then(module => ({ default: module.TokensManagementPage })));
const SystemSettings = lazy(() => import('@/features/admin/pages/SystemSettingsPage').then(module => ({ default: module.SystemSettingsPage })));

// Pages de configuration des services
const LaunchpadConfig = lazy(() => import('@/features/services/pages/LaunchpadConfigPage').then(module => ({ default: module.LaunchpadConfigPage })));
const MarketingConfig = lazy(() => import('@/features/services/pages/MarketingConfigPage').then(module => ({ default: module.MarketingConfigPage })));
const KYCConfig = lazy(() => import('@/features/services/pages/KYCConfigPage').then(module => ({ default: module.KYCConfigPage })));

// Types
export interface RouteConfig {
  path: string;
  title: string;
  icon?: string;
  isProtected?: boolean;
  isPublic?: boolean;
}

// Configuration des routes
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      // Routes Publiques
      {
        index: true,
        element: <Home />
      },
      {
        path: 'auth',
        element: <PublicGuard><Auth /></PublicGuard>
      },
      {
        path: 'docs',
        element: <Documentation />
      },
      {
        path: 'learn',
        element: <Learn />
      },
      {
        path: 'blog',
        element: <Blog />
      },
      {
        path: 'partnership',
        element: <Partnership />
      },
      {
        path: 'plans',
        element: <Plans />
      },
      {
        path: 'services',
        element: <Services />
      },

      // Routes Protégées
      {
        path: 'dashboard',
        element: <AuthGuard><Dashboard /></AuthGuard>
      },
      {
        path: 'profile',
        element: <AuthGuard><Profile /></AuthGuard>
      },
      {
        path: 'create-token',
        element: <AuthGuard><CreateToken /></AuthGuard>
      },
      {
        path: 'tokens',
        element: <AuthGuard><TokenList /></AuthGuard>
      },
      {
        path: 'tokens/:id',
        element: <AuthGuard><TokenDetails /></AuthGuard>
      },

      // Routes de Services Protégées
      {
        path: 'services/launchpad/config',
        element: <AuthGuard><LaunchpadConfig /></AuthGuard>
      },
      {
        path: 'services/marketing/config',
        element: <AuthGuard><MarketingConfig /></AuthGuard>
      },
      {
        path: 'services/kyc/config',
        element: <AuthGuard><KYCConfig /></AuthGuard>
      },

      // Routes Admin
      {
        path: 'admin',
        element: <AdminGuard><AdminDashboard /></AdminGuard>
      },
      {
        path: 'admin/users',
        element: <AdminGuard><UsersManagement /></AdminGuard>
      },
      {
        path: 'admin/tokens',
        element: <AdminGuard><TokensManagement /></AdminGuard>
      },
      {
        path: 'admin/settings',
        element: <AdminGuard><SystemSettings /></AdminGuard>
      },

      // Route 404
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];

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
    path: '/docs',
    title: 'Documentation',
    isPublic: true,
  },
]; 