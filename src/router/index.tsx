import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './routes.tsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { logger } from '../core/logger';

// Configuration du router avec les options adaptées pour réduire les avertissements
const router = createBrowserRouter(routes, {
  basename: '/' // Définit explicitement le basename pour éviter les problèmes de chemins relatifs
});

logger.info({
  category: 'Router',
  message: 'Configuration du router initialisée',
  data: { routesCount: routes.length }
});

export const Router: React.FC = () => {
  return (
    <RouterProvider
      router={router}
      fallbackElement={<LoadingSpinner />}
      future={{
        v7_startTransition: true
        // Note: Nous utilisons seulement les options supportées par React Router v6
        // Les autres options comme v7_relativeSplatPath seront supportées dans la version v7
      }}
    />
  );
};
