import type { RouteObject } from 'react-router-dom';
import type { PageComponent } from './pages';

export interface AppRoute {
  path: string;
  component: PageComponent;
  children?: AppRoute[];
}

export type AppRouteObject = Omit<RouteObject, 'children'> & {
  children?: AppRouteObject[];
};
