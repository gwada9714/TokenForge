import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AdminRoute from './guards/AdminRoute';
import LoadingFallback from '../components/common/LoadingFallback';

// Admin components
const AdminDashboard = lazy(() => import('../components/features/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const ContractControls = lazy(() => import('../components/features/admin/contract/ContractControls').then(module => ({ default: module.ContractControls })));
const OwnershipManagement = lazy(() => import('../components/features/admin/ownership/OwnershipManagement').then(module => ({ default: module.OwnershipManagement })));
const AlertsManagement = lazy(() => import('../components/features/admin/alerts/AlertsManagement').then(module => ({ default: module.AlertsManagement })));
const AuditLogs = lazy(() => import('../components/features/admin/audit/AuditLogs').then(module => ({ default: module.AuditLogs })));

// Wrapper pour les composants lazy-loadés
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

export const adminRoutes = {
  path: 'admin',
  element: <AdminRoute><LazyWrapper><Outlet /></LazyWrapper></AdminRoute>,
  children: [
    {
      index: true,
      element: <LazyWrapper><AdminDashboard /></LazyWrapper>
    },
    {
      path: 'contract',
      element: <LazyWrapper><ContractControls /></LazyWrapper>
    },
    {
      path: 'ownership',
      element: <LazyWrapper><OwnershipManagement /></LazyWrapper>
    },
    {
      path: 'alerts',
      element: <LazyWrapper><AlertsManagement /></LazyWrapper>
    },
    {
      path: 'audit',
      element: <LazyWrapper><AuditLogs /></LazyWrapper>
    }
  ]
};
