import { lazy } from 'react';

// Types
export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  protected?: boolean;
  requireAdmin?: boolean;
  layout?: boolean;
  children?: RouteConfig[];
}

// Lazy loading des composants
const HomePage = lazy(() => import('../pages/Home').then(module => ({ default: module.default || module.Home })));
const LoginForm = lazy(() => import('../components/auth/LoginForm').then(module => ({ default: module.default || module.LoginForm })));
const SignUpForm = lazy(() => import('../components/auth/SignUpForm').then(module => ({ default: module.default || module.SignUpForm })));
const TokenWizard = lazy(() => import('../components/TokenWizard/TokenWizard'));
const StakingDashboard = lazy(() => import('../components/Staking/StakingDashboard'));
const ProfitDashboard = lazy(() => import('../components/Dashboard/ProfitDashboard'));
const LaunchpadPage = lazy(() => import('../pages/Launchpad'));
const MyTokens = lazy(() => import('../pages/MyTokens'));
const Pricing = lazy(() => import('../pages/Pricing'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));

// Composants admin avec gestion des exports nommés
const ContractControls = lazy(() => 
  import('../components/admin/ContractControls')
    .then(module => ({ default: module.default || module.ContractControls }))
);

const OwnershipManagement = lazy(() => 
  import('../components/admin/OwnershipManagement')
    .then(module => ({ default: module.default || module.OwnershipManagement }))
);

const AlertsManagement = lazy(() => 
  import('../components/admin/AlertsManagement')
    .then(module => ({ default: module.default || module.AlertsManagement }))
);

const AuditLogs = lazy(() => 
  import('../components/admin/AuditLogs')
    .then(module => ({ default: module.default || module.AuditLogs }))
);

// Configuration des routes
export const routes: RouteConfig[] = [
  {
    path: '/',
    component: HomePage,
    layout: true
  },
  {
    path: '/login',
    component: LoginForm
  },
  {
    path: '/signup',
    component: SignUpForm
  },
  {
    path: '/create',
    component: TokenWizard,
    protected: true,
    layout: true
  },
  {
    path: '/staking',
    component: StakingDashboard,
    protected: true,
    layout: true
  },
  {
    path: '/profit',
    component: ProfitDashboard,
    protected: true,
    layout: true
  },
  {
    path: '/launchpad',
    component: LaunchpadPage,
    layout: true
  },
  {
    path: '/my-tokens',
    component: MyTokens,
    protected: true,
    layout: true
  },
  {
    path: '/pricing',
    component: Pricing,
    layout: true
  },
  {
    path: '/admin',
    component: AdminDashboard,
    protected: true,
    requireAdmin: true,
    layout: true,
    children: [
      {
        path: 'contracts',
        component: ContractControls,
        protected: true,
        requireAdmin: true
      },
      {
        path: 'ownership',
        component: OwnershipManagement,
        protected: true,
        requireAdmin: true
      },
      {
        path: 'alerts',
        component: AlertsManagement,
        protected: true,
        requireAdmin: true
      },
      {
        path: 'logs',
        component: AuditLogs,
        protected: true,
        requireAdmin: true
      }
    ]
  }
];

// Helper functions
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  const findRoute = (routes: RouteConfig[], targetPath: string): RouteConfig | undefined => {
    for (const route of routes) {
      if (route.path === targetPath) return route;
      if (route.children) {
        const childRoute = findRoute(route.children, targetPath);
        if (childRoute) return childRoute;
      }
    }
    return undefined;
  };

  return findRoute(routes, path);
};

export const isProtectedRoute = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route?.protected || false;
};

export const requiresAdmin = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route?.requireAdmin || false;
};

export const needsLayout = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route?.layout || false;
};
