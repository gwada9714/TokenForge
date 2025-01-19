import { lazy } from 'react';
import { Outlet } from 'react-router-dom';
import AdminRoute from '../routes/guards/AdminRoute';

// Admin components
const AdminDashboard = lazy(() => import('../components/features/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const ContractControls = lazy(() => import('../components/features/admin/contract/ContractControls').then(module => ({ default: module.ContractControls })));
const OwnershipManagement = lazy(() => import('../components/features/admin/ownership/OwnershipManagement').then(module => ({ default: module.OwnershipManagement })));
const AlertsManagement = lazy(() => import('../components/features/admin/alerts/AlertsManagement').then(module => ({ default: module.AlertsManagement })));
const AuditLogs = lazy(() => import('../components/features/admin/audit/AuditLogs').then(module => ({ default: module.AuditLogs })));

export const adminRoutes = {
  path: 'admin',
  element: <AdminRoute><Outlet /></AdminRoute>,
  children: [
    {
      index: true,
      element: <AdminDashboard />
    },
    {
      path: 'contract',
      element: <ContractControls />
    },
    {
      path: 'ownership',
      element: <OwnershipManagement />
    },
    {
      path: 'alerts',
      element: <AlertsManagement />
    },
    {
      path: 'audit',
      element: <AuditLogs />
    }
  ]
};
