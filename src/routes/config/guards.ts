import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

export interface RouteGuard {
  canActivate: () => boolean | Promise<boolean>;
}

export const createProtectedRoute = (route: RouteObject, guard: RouteGuard): RouteObject => {
  return {
    ...route,
    element: async () => {
      const canActivate = await Promise.resolve(guard.canActivate());
      return canActivate ? route.element : <Navigate to="/login" replace />;
    }
  };
};
