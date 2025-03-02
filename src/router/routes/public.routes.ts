import { RouteObject } from 'react-router-dom';

/**
 * Routes publiques
 * Accessibles sans authentification
 */
export const publicRoutes: RouteObject[] = [
    {
        path: '/',
        element: null
    },
    {
        path: '/auth',
        element: null
    },
    {
        path: '/about',
        element: null
    }
];
