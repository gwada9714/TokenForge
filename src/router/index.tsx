import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './routes.tsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Configuration du router avec les options de base
const router = createBrowserRouter(routes);

export const Router: React.FC = () => {
  return (
    <RouterProvider
      router={router}
      fallbackElement={<LoadingSpinner />}
      future={{
        v7_startTransition: true
      }}
    />
  );
};
