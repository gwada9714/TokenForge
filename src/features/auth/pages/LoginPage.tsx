import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components';
import { useTokenForgeAuth } from '../providers/TokenForgeAuthProvider';
import { AuthError, AuthErrorCode, createAuthError } from '../errors/AuthError';
import { LoginForm } from '../components/LoginForm';
import { logger } from '../../../utils/firebase-logger';

export const LoginPage: React.FC = () => {
  // États pour le formulaire
  const [loginMethod, setLoginMethod] = useState<'email' | 'wallet'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<AuthError | null>(null);
  
  const navigate = useNavigate();
  const { signIn, error: authError, isAuthenticated, connectWallet } = useTokenForgeAuth();

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Fonction pour gérer la connexion par email/mot de passe
  const handleEmailLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    setLocalError(null);

    try {
      logger.info({
        category: 'Auth',
        message: 'Tentative de connexion par email',
        data: { email: email.substring(0, 3) + '***' }
      });
      
      await signIn(email, password);
      
      // La redirection sera gérée par l'effect quand isAuthenticated changera
    } catch (err) {
      const authError = err as AuthError;
      setLocalError(authError);
      
      logger.error({
        category: 'Auth',
        message: 'Échec de connexion par email',
        error: err
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour gérer la connexion par wallet
  const handleWalletLogin = async () => {
    setIsSubmitting(true);
    setLocalError(null);

    try {
      logger.info({
        category: 'Auth',
        message: 'Tentative de connexion par wallet'
      });
      
      // Pour l'exemple, nous utilisons des valeurs fictives mais dans un cas réel
      // vous utiliseriez une bibliothèque comme viem, ethers.js ou web3.js
      // pour obtenir l'adresse du wallet et le chainId
      await connectWallet('0x0000000000000000000000000000000000000000', 1);
      
      // La redirection sera gérée par l'effect quand isAuthenticated changera
    } catch (err) {
      const walletError = createAuthError(
        AuthErrorCode.WALLET_CONNECTION_ERROR,
        'Erreur de connexion avec le wallet. Veuillez réessayer.',
        err
      );
      
      setLocalError(walletError);
      
      logger.error({
        category: 'Auth',
        message: 'Échec de connexion par wallet',
        error: err
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Détermine quelle erreur afficher (contextuelle ou locale)
  const displayError = authError || localError;

  return (
    <>
      <SEOHead
        title="Connexion - TokenForge"
        description="Connectez-vous à votre compte TokenForge pour accéder à votre tableau de bord et gérer vos tokens."
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Connexion à TokenForge
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Ou{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                créez un compte gratuitement
              </Link>
            </p>
          </div>

          {/* Sélection de la méthode de connexion */}
          <div className="flex rounded-md shadow-sm mb-6" role="group">
            <button
              type="button"
              className={`w-1/2 py-2 px-4 text-sm font-medium rounded-l-md focus:outline-none ${loginMethod === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              onClick={() => setLoginMethod('email')}
            >
              Email & Mot de passe
            </button>
            <button
              type="button"
              className={`w-1/2 py-2 px-4 text-sm font-medium rounded-r-md focus:outline-none ${loginMethod === 'wallet'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              onClick={() => setLoginMethod('wallet')}
            >
              Wallet
            </button>
          </div>

          {/* Formulaire de connexion par email */}
          {loginMethod === 'email' ? (
            <LoginForm 
              onSubmit={handleEmailLogin}
              isLoading={isSubmitting}
              error={displayError}
            />
          ) : (
            // Connexion par wallet
            <div className="mt-8 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
                  Connectez-vous en utilisant votre wallet Ethereum. Assurez-vous que votre wallet est configuré sur le réseau correct.
                </p>

                {displayError && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700 dark:text-red-200">{displayError.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleWalletLogin}
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 784.37 1277.39" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M392.07 0l-8.57 29.11v844.63l8.57 8.55 392.06-231.75z" />
                    <path fill="currentColor" d="M392.07 0L0 650.54l392.07 231.75V472.33z" />
                    <path fill="currentColor" d="M392.07 956.52l-4.83 5.89v300.87l4.83 14.1 392.3-552.49z" />
                    <path fill="currentColor" d="M392.07 1277.38V956.52L0 724.89z" />
                    <path fill="currentColor" d="M392.07 882.29l392.06-231.75-392.06-178.21z" />
                  </svg>
                  {isSubmitting ? 'Connexion en cours...' : 'Connecter le wallet'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
