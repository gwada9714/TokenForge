import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
// Utiliser nos guards de diagnostic au lieu des guards d'authentification réels
import { AuthGuard, AdminGuard, PublicGuard } from '../guards/DiagnosticGuard';
// Utiliser notre layout de diagnostic
import { Layout } from '../layouts/DiagnosticLayout';

// 1. Pages Générales
const Home = lazy(() => import('@/features/home/pages/HomePage').then(module => ({ default: module.HomePage })));
const About = lazy(() => import('@/features/about/pages/AboutPage').then(module => ({ default: module.AboutPage })));
const Plans = lazy(() => import('@/features/pricing/pages/PlansPage').then(module => ({ default: module.PlansPage })));
const FAQ = lazy(() => import('@/features/faq/pages/FAQPage').then(module => ({ default: module.FAQPage })));
const Contact = lazy(() => import('@/features/contact/pages/ContactPage').then(module => ({ default: module.ContactPage })));
const Blog = lazy(() => import('@/features/blog/pages/BlogPage').then(module => ({ default: module.BlogPage })));
const BlogPost = lazy(() => import('@/features/blog/pages/BlogPostPage').then(module => ({ default: module.BlogPostPage })));
const Resources = lazy(() => import('@/features/resources/pages/ResourcesPage').then(module => ({ default: module.ResourcesPage })));
const NotFound = lazy(() => import('@/features/common/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

// 2. Système d'Authentification
const Auth = lazy(() => import('@/features/auth/pages/AuthPage').then(module => ({ default: module.AuthPage })));
const Login = lazy(() => import('@/features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const Register = lazy(() => import('@/features/auth/pages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const RecoverAccount = lazy(() => import('@/features/auth/pages/RecoverAccountPage').then(module => ({ default: module.RecoverAccountPage })));
const Profile = lazy(() => import('@/features/auth/pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
// Composant de test d'authentification
const AuthTest = lazy(() => import('@/features/auth/components/AuthTestComponent').then(module => ({ default: module.default })));
// Composant de test Firestore
const FirestoreTest = lazy(() => import('@/components/test/FirestoreTestComponent').then(module => ({ default: module.default })));
// Ajout: Page de test Firebase
const FirebaseTestPage = lazy(() => import('@/pages/FirebaseTestPage').then(module => ({ default: module.default })));

// 3. Création de Token
const CreateToken = lazy(() => import('@/pages/CreateToken').then(module => ({ default: module.default })));
const TokenTemplates = lazy(() => import('@/features/token/pages/TokenTemplatesPage').then(module => ({ default: module.TokenTemplatesPage })));
const TokenomicsDesigner = lazy(() => import('@/features/tokenomics/pages/TokenomicsDesignerPage'));
const AntiRugpullConfigurator = lazy(() => import('@/features/token/pages/AntiRugpullConfiguratorPage'));
const LandingPageBuilder = lazy(() => import('@/features/token/pages/LandingPageBuilderPage').then(module => ({ default: module.LandingPageBuilderPage })));

// 4. Gestion de Token
const Dashboard = lazy(() => import('@/features/dashboard/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const TokenList = lazy(() => import('@/features/token/pages/TokenListPage').then(module => ({ default: module.TokenListPage })));
const TokenDetails = lazy(() => import('@/features/token/pages/TokenDetailsPage').then(module => ({ default: module.TokenDetailsPage })));
const AutoLiquidityManager = lazy(() => import('@/features/token/pages/AutoLiquidityManagerPage'));
const StakingManager = lazy(() => import('@/features/token-staking/pages/StakingManagerPage'));

// 5. Services Premium
const HolderAnalytics = lazy(() => import('@/features/analytics/pages/HolderAnalyticsPage').then(module => ({ default: module.HolderAnalyticsPage })));
const MultiChainBridge = lazy(() => import('@/features/multi-chain/pages/MultiChainBridgePage').then(module => ({ default: module.MultiChainBridgePage })));
const ExpertNetwork = lazy(() => import('@/features/partnership/pages/ExpertNetworkPage').then(module => ({ default: module.ExpertNetworkPage })));
const DefiIntegrationHub = lazy(() => import('@/features/services/pages/DefiIntegrationHubPage').then(module => ({ default: module.DefiIntegrationHubPage })));
const TokenSpotlight = lazy(() => import('@/features/services/pages/TokenSpotlightPage').then(module => ({ default: module.TokenSpotlightPage })));
const LegalTemplateLibrary = lazy(() => import('@/features/services/pages/LegalTemplateLibraryPage').then(module => ({ default: module.LegalTemplateLibraryPage })));

// 6. Administration
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));
const UsersManagement = lazy(() => import('@/features/admin/pages/UsersManagementPage').then(module => ({ default: module.UsersManagementPage })));
const TokensManagement = lazy(() => import('@/features/admin/pages/TokensManagementPage').then(module => ({ default: module.TokensManagementPage })));
const SystemSettings = lazy(() => import('@/features/admin/pages/SystemSettingsPage').then(module => ({ default: module.SystemSettingsPage })));
// Remplace le import par un composant temporaire ou stub en attendant la création du fichier
const AnalyticsReporting = lazy(() => import('@/features/admin/pages/SystemSettingsPage').then(module => ({ default: module.SystemSettingsPage })));
const MarketplaceManagement = lazy(() => import('@/features/admin/pages/MarketplaceManagementPage').then(module => ({ default: module.MarketplaceManagementPage })));

// 7. Pages Community & Support
const CommunityCenter = lazy(() => import('@/features/community/pages/CommunityCenterPage').then(module => ({ default: module.CommunityCenterPage })));
const KnowledgeBase = lazy(() => import('@/features/learn/pages/KnowledgeBasePage').then(module => ({ default: module.KnowledgeBasePage })));
const AmbassadorProgram = lazy(() => import('@/features/community/pages/AmbassadorProgramPage'));
const WebinarsEvents = lazy(() => import('@/features/community/pages/WebinarsEventsPage').then(module => ({ default: module.WebinarsEventsPage })));

// 8. Pages Mobiles (ces pages utilisent des layouts responsifs, pas besoin de pages séparées)

// Pages de configuration des services
// Remplace les imports manquants par des composants temporaires
const LaunchpadConfig = lazy(() => import('@/features/services/pages/MarketingConfigPage').then(module => ({ default: module.MarketingConfigPage })));
const MarketingConfig = lazy(() => import('@/features/services/pages/MarketingConfigPage').then(module => ({ default: module.MarketingConfigPage })));
const KYCConfig = lazy(() => import('@/features/services/pages/MarketingConfigPage').then(module => ({ default: module.MarketingConfigPage })));

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
      // 1. Routes Publiques - Pages Générales
      {
        index: true,
        element: <Home />
      },
      {
        path: 'about',
        element: <About />
      },
      {
        path: 'plans',
        element: <Plans />
      },
      {
        path: 'faq',
        element: <FAQ />
      },
      {
        path: 'contact',
        element: <Contact />
      },
      {
        path: 'blog',
        element: <Blog />
      },
      {
        path: 'blog/:id',
        element: <BlogPost />
      },
      {
        path: 'resources',
        element: <Resources />
      },

      // 2. Système d'Authentification
      {
        path: 'auth',
        element: <PublicGuard><Auth /></PublicGuard>
      },
      {
        path: 'login',
        element: <PublicGuard><Login /></PublicGuard>
      },
      {
        path: 'register',
        element: <PublicGuard><Register /></PublicGuard>
      },
      {
        path: 'recover-account',
        element: <PublicGuard><RecoverAccount /></PublicGuard>
      },
      {
        path: 'profile',
        element: <AuthGuard><Profile /></AuthGuard>
      },
      // Route de test d'authentification
      {
        path: 'auth-test',
        element: <AuthTest />
      },

      // 3. Création de Token
      {
        path: 'create-token',
        element: <AuthGuard><CreateToken /></AuthGuard>
      },
      {
        path: 'create-token/:blockchain',
        element: <AuthGuard><CreateToken /></AuthGuard>
      },
      {
        path: 'token-templates',
        element: <TokenTemplates />
      },
      {
        path: 'tokenomics-designer',
        element: <AuthGuard><TokenomicsDesigner /></AuthGuard>
      },
      {
        path: 'anti-rugpull-configurator',
        element: <AuthGuard><AntiRugpullConfigurator /></AuthGuard>
      },
      {
        path: 'landing-page-builder',
        element: <AuthGuard><LandingPageBuilder /></AuthGuard>
      },

      // 4. Gestion de Token
      {
        path: 'dashboard',
        element: <AuthGuard><Dashboard /></AuthGuard>
      },
      {
        path: 'tokens',
        element: <AuthGuard><TokenList /></AuthGuard>
      },
      {
        path: 'tokens/:id',
        element: <AuthGuard><TokenDetails /></AuthGuard>
      },
      {
        path: 'tokens/:id/liquidity',
        element: <AuthGuard><AutoLiquidityManager /></AuthGuard>
      },
      {
        path: 'tokens/:id/staking',
        element: <AuthGuard><StakingManager /></AuthGuard>
      },

      // 5. Services Premium
      {
        path: 'services/holder-analytics',
        element: <AuthGuard><HolderAnalytics /></AuthGuard>
      },
      {
        path: 'services/multi-chain-bridge',
        element: <AuthGuard><MultiChainBridge /></AuthGuard>
      },
      {
        path: 'services/expert-network',
        element: <AuthGuard><ExpertNetwork /></AuthGuard>
      },
      {
        path: 'services/defi-integration',
        element: <AuthGuard><DefiIntegrationHub /></AuthGuard>
      },
      {
        path: 'services/token-spotlight',
        element: <AuthGuard><TokenSpotlight /></AuthGuard>
      },
      {
        path: 'services/legal-templates',
        element: <AuthGuard><LegalTemplateLibrary /></AuthGuard>
      },

      // 6. Administration
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
      {
        path: 'admin/analytics',
        element: <AdminGuard><AnalyticsReporting /></AdminGuard>
      },
      {
        path: 'admin/marketplace',
        element: <AdminGuard><MarketplaceManagement /></AdminGuard>
      },

      // 7. Community & Support
      {
        path: 'community',
        element: <CommunityCenter />
      },
      {
        path: 'knowledge-base',
        element: <KnowledgeBase />
      },
      {
        path: 'ambassador-program',
        element: <AmbassadorProgram />
      },
      {
        path: 'webinars-events',
        element: <WebinarsEvents />
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

      // Routes de test (développement uniquement)
      {
        path: 'test/auth',
        element: (
          <AuthGuard>
            <AuthTest />
          </AuthGuard>
        )
      },
      {
        path: 'test/firestore',
        element: (
          <AuthGuard>
            <FirestoreTest />
          </AuthGuard>
        )
      },
      {
        path: 'test/firebase',
        element: (
          <AuthGuard>
            <FirebaseTestPage />
          </AuthGuard>
        )
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
  // Routes publiques
  {
    path: '/',
    title: 'Accueil',
    isPublic: true,
  },
  {
    path: '/about',
    title: 'À Propos',
    isPublic: true,
  },
  {
    path: '/plans',
    title: 'Plans & Tarifs',
    isPublic: true,
  },
  {
    path: '/faq',
    title: 'FAQ',
    isPublic: true,
  },
  {
    path: '/contact',
    title: 'Contact & Support',
    isPublic: true,
  },
  {
    path: '/blog',
    title: 'Blog & Ressources',
    isPublic: true,
  },
  {
    path: '/token-templates',
    title: 'Templates de Tokens',
    isPublic: true,
  },

  // Routes protégées
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
    path: '/tokenomics-designer',
    title: 'Tokenomics Designer',
    isProtected: true,
  },
  {
    path: '/profile',
    title: 'Mon Profil',
    isProtected: true,
  },

  // Routes communautaires
  {
    path: '/community',
    title: 'Communauté',
    isPublic: true,
  },
  {
    path: '/knowledge-base',
    title: 'Base de Connaissances',
    isPublic: true,
  },
];
