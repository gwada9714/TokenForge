import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import ProtectedRoute from '../guards/ProtectedRoute';
import LazyWrapper from '../../components/LazyWrapper';

const AdminDashboard = lazy(() => import('../../components/features/admin/AdminDashboard'));
const ContractManagement = lazy(() => import('../../components/features/admin/ContractManagement'));
const UserManagement = lazy(() => import('../../components/features/admin/UserManagement'));
const Settings = lazy(() => import('../../components/features/admin/Settings'));

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: (
    <ProtectedRoute adminOnly>
      <LazyWrapper>
        <AdminDashboard />
      </LazyWrapper>
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <ContractManagement />
    },
    {
      path: 'users',
      element: <UserManagement />
    },
    {
      path: 'settings',
      element: <Settings />
    }
  ]
};
