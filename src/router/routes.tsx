import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import Layout from '../components/layout/Layout';
import { publicRoutes } from './routes/public.routes';
import { tokenRoutes } from './routes/token.routes';
import { marketplaceRoutes } from './routes/marketplace.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { adminRoutes } from './routes/admin.routes';

// Configure future flags for React Router v7
export const future = {
  v7_normalizeFormMethod: true,
  v7_prependBasename: true,
};

// Configure browser router with all routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      ...publicRoutes,
      ...tokenRoutes,
      ...marketplaceRoutes,
      ...dashboardRoutes,
      adminRoutes,
    ],
  },
]);
