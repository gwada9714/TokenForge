/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Suspense, lazy } from 'react';
import type { AppRoute, AppRouteObject } from '../types/router';
import LoadingComponent from '../components/common/LoadingComponent';

export function createRouteObject(route: AppRoute): AppRouteObject {
  const { path, component: Component, children } = route;
  
  return {
    path,
    element: (
      <Suspense fallback={<LoadingComponent />}>
        <Component />
      </Suspense>
    ),
    ...(children && { children: children.map(createRouteObject) })
  };
}

export const routes: AppRoute[] = [
  {
    path: '/',
    component: lazy(() => import('../pages/Home').then(m => ({ default: m.default })))
  },
  {
    path: '/tokens/:address',
    component: lazy(() => import('../pages/TokenDetails').then(m => ({ default: m.default })))
  }
];
