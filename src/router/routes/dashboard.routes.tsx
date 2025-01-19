import React from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../../features/auth';
import { UserDashboard } from '../../features/dashboard/components/UserDashboard';
import { UserProfile } from '../../features/dashboard/components/UserProfile';
import { UserSettings } from '../../features/dashboard/components/UserSettings';

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: 'profile',
    element: (
      <ProtectedRoute>
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: 'settings',
    element: (
      <ProtectedRoute>
        <UserSettings />
      </ProtectedRoute>
    ),
  },
];
