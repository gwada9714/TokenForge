import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes.config';

export const NotFound: React.FC = () => {
  return (
    <div className="text-center">
      <h1>404 - Page non trouvée</h1>
      <Link to={ROUTES.DEFAULT} className="text-blue-500 hover:underline">
        Retour à l'accueil
      </Link>
    </div>
  );
};
