import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import ProtectedRoute from '../guards/ProtectedRoute';
import LazyWrapper from '../../components/LazyWrapper';

const Marketplace = lazy(() => import('../../components/features/marketplace/Marketplace'));
const ListItem = lazy(() => import('../../components/features/marketplace/ListItem'));
const ItemDetails = lazy(() => import('../../components/features/marketplace/ItemDetails'));

export const marketplaceRoutes: RouteObject[] = [
  {
    path: '/marketplace',
    children: [
      {
        index: true,
        element: (
          <LazyWrapper>
            <Marketplace />
          </LazyWrapper>
        )
      },
      {
        path: 'list',
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <ListItem />
            </LazyWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: ':itemId',
        element: (
          <LazyWrapper>
            <ItemDetails />
          </LazyWrapper>
        )
      }
    ]
  }
];
