import React from 'react';
import { RouteObject } from 'react-router-dom';
import { AdminRoute } from '../../features/auth';
import { AdminDashboard } from '../../features/admin/components/AdminDashboard';

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },
];
