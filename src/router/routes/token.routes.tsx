import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import ProtectedRoute from '../guards/ProtectedRoute';
import LazyWrapper from '../../components/common/lazy/LazyWrapper';
import { Outlet } from 'react-router-dom';

const TokenWizard = lazy(() => import('../../components/features/token/creation/TokenWizard'));
const MyTokens = lazy(() => import('../../components/features/token/components/MyTokens'));
const TokenDetailsContainer = lazy(() => import('../../components/features/token/manager/TokenDetailsContainer'));

export const tokenRoutes: RouteObject[] = [
  {
    path: 'tokens',
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: (
          <LazyWrapper>
            <MyTokens />
          </LazyWrapper>
        ),
      },
      {
        path: 'create',
        element: (
          <LazyWrapper>
            <TokenWizard />
          </LazyWrapper>
        ),
      },
      {
        path: ':tokenId',
        element: (
          <LazyWrapper>
            <TokenDetailsContainer />
          </LazyWrapper>
        ),
      },
    ],
  },
];
