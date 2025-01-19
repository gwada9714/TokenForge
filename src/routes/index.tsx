import { createBrowserRouter } from 'react-router-dom';
import { routes } from './config/routes';

export const router = createBrowserRouter(routes);

export * from './config/routes';
export * from './guards/AdminRoute';
export * from './components/LoadingFallback';