import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import ProtectedRoute from '../guards/ProtectedRoute';
import LazyWrapper from '../../components/LazyWrapper';

const StakingDashboard = lazy(() => import('../../components/features/dashboard/StakingDashboard'));
const ProfitDashboard = lazy(() => import('../../components/features/dashboard/ProfitDashboard'));

export const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    children: [
      {
        path: 'staking',
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <StakingDashboard />
            </LazyWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: 'profit',
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <ProfitDashboard />
            </LazyWrapper>
          </ProtectedRoute>
        )
      }
    ]
  }
];
