import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { clearAuthError } from '../store/authSlice';
import { AUTH_ERROR_CODES } from '../errors/AuthError';

interface ErrorMessageMapping {
  title: string;
  description: string;
  action?: string;
}

const ERROR_MESSAGES: Record<keyof typeof AUTH_ERROR_CODES, ErrorMessageMapping> = {
  SIGN_IN_ERROR: {
    title: 'Erreur de connexion',
    description: 'Impossible de vous connecter. Vérifiez vos identifiants.',
    action: 'Réessayer'
  },
  SIGN_OUT_ERROR: {
    title: 'Erreur de déconnexion',
    description: 'Impossible de vous déconnecter. Veuillez réessayer.',
    action: 'Réessayer'
  },
  SESSION_EXPIRED: {
    title: 'Session expirée',
    description: 'Votre session a expiré. Veuillez vous reconnecter.',
    action: 'Se reconnecter'
  },
  INVALID_TOKEN: {
    title: 'Token invalide',
    description: 'Votre session n\'est plus valide. Veuillez vous reconnecter.',
    action: 'Se reconnecter'
  },
  USER_NOT_FOUND: {
    title: 'Utilisateur non trouvé',
    description: 'Cet utilisateur n\'existe pas.',
    action: 'Vérifier'
  },
  CREATE_USER_ERROR: {
    title: 'Erreur de création',
    description: 'Impossible de créer le compte. Veuillez réessayer.',
    action: 'Réessayer'
  },
  UPDATE_USER_ERROR: {
    title: 'Erreur de mise à jour',
    description: 'Impossible de mettre à jour le profil.',
    action: 'Réessayer'
  },
  DELETE_USER_ERROR: {
    title: 'Erreur de suppression',
    description: 'Impossible de supprimer le compte.',
    action: 'Réessayer'
  },
  INVALID_DATA: {
    title: 'Données invalides',
    description: 'Les données fournies sont invalides.',
    action: 'Vérifier'
  },
  SERVICE_NOT_INITIALIZED: {
    title: 'Service non initialisé',
    description: 'Le service d\'authentification n\'est pas initialisé.',
    action: 'Réessayer'
  },
  NETWORK_ERROR: {
    title: 'Erreur réseau',
    description: 'Impossible de se connecter au serveur.',
    action: 'Réessayer'
  },
  FIREBASE_ERROR: {
    title: 'Erreur Firebase',
    description: 'Une erreur est survenue avec Firebase.',
    action: 'Réessayer'
  },
  UNKNOWN_ERROR: {
    title: 'Erreur inconnue',
    description: 'Une erreur inattendue est survenue.',
    action: 'Réessayer'
  }
};

export const AuthError: React.FC = () => {
  const dispatch = useDispatch();
  const error = useSelector((state: RootState) => state.auth.error);

  if (!error) return null;

  const errorInfo = ERROR_MESSAGES[error.code as keyof typeof AUTH_ERROR_CODES] || {
    title: 'Erreur',
    description: error.message || 'Une erreur est survenue.',
    action: 'Fermer'
  };

  const handleDismiss = () => {
    dispatch(clearAuthError());
  };

  return (
    <div className="fixed inset-x-0 bottom-0 pb-2 sm:pb-5">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-red-600 p-2 shadow-lg sm:p-3">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex w-0 flex-1 items-center">
              <span className="flex rounded-lg bg-red-800 p-2">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </span>
              <p className="ml-3 truncate font-medium text-white">
                <span className="md:hidden">{errorInfo.title}</span>
                <span className="hidden md:inline">{errorInfo.description}</span>
              </p>
            </div>
            <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
              {errorInfo.action && (
                <button
                  onClick={handleDismiss}
                  className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50"
                >
                  {errorInfo.action}
                </button>
              )}
            </div>
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button
                onClick={handleDismiss}
                type="button"
                className="-mr-1 flex rounded-md p-2 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="sr-only">Fermer</span>
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
