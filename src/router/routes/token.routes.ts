import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import ProtectedRoute from '../guards/ProtectedRoute';
import LazyWrapper from '../../components/LazyWrapper';

const TokenWizard = lazy(() => import('../../components/features/tokens/TokenWizard'));
const MyTokens = lazy(() => import('../../components/features/tokens/MyTokens'));
const TokenDetails = lazy(() => import('../../components/features/tokens/TokenDetails'));

export const tokenRoutes: RouteObject[] = [
  {
    path: '/tokens',
    children: [
      {
        path: 'create',
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <TokenWizard />
            </LazyWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: 'my-tokens',
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <MyTokens />
            </LazyWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: ':tokenAddress',
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <TokenDetails />
            </LazyWrapper>
          </ProtectedRoute>
        )
      }
    ]
  }
];
