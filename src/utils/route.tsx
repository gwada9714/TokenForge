import React, { Suspense } from 'react';
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
