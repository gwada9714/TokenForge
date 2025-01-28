import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import LazyWrapper from '../../components/common/lazy/LazyWrapper';

const Home = lazy(() => import('../../pages/Home'));
const Login = lazy(() => import('../../pages/auth/LoginPage'));
const NotFound = lazy(() => import('../../pages/errors/NotFound'));

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <LazyWrapper><Home /></LazyWrapper>
  },
  {
    path: '/login',
    element: <LazyWrapper><Login /></LazyWrapper>
  },
  {
    path: '*',
    element: <LazyWrapper><NotFound /></LazyWrapper>
  }
];
