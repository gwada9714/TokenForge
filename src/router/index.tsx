import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';

export function Router() {
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
} 