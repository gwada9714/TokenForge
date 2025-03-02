import { RouteObject } from 'react-router-dom';

/**
 * Routes liées au marketplace
 */
export const marketplaceRoutes: RouteObject[] = [
    {
        path: '/marketplace',
        element: null
    },
    {
        path: '/marketplace/:category',
        element: null
    },
    {
        path: '/marketplace/item/:id',
        element: null
    }
];
