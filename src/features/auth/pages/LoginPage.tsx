import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components';

export const LoginPage: React.FC = () => {
  // États pour le formulaire
  const [loginMethod, setLoginMethod] = useState<'email' | 'wallet'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour gérer la connexion par email/mot de passe
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Simulation d'une connexion (à remplacer par l'appel API réel)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirection vers le tableau de bord (à implémenter)
      console.log('Connexion réussie avec:', { email, password, rememberMe });
      // window.location.href = '/dashboard';
    } catch (err) {
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour gérer la connexion par wallet
  const handleWalletLogin = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Simulation de connexion wallet (à remplacer par l'intégration réelle)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirection vers le tableau de bord (à implémenter)
      console.log('Connexion wallet réussie');
      // window.location.href = '/dashboard';
    } catch (err) {
      setError('Erreur de connexion avec le wallet. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

          {/* Affichage des erreurs */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire de connexion par email */}
          {loginMethod === 'email' ? (
            <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">Adresse email</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Adresse email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Mot de passe</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Mot de passe"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    Mot de passe oublié?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </div>
            </form>
          ) : (
            // Connexion par wallet
            <div className="mt-8 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
                  Connectez-vous en utilisant votre wallet Ethereum. Assurez-vous que votre wallet est configuré sur le réseau correct.
                </p>

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
                    <path fill="currentColor" d="M0 650.54l392.07 231.75V472.33z" />
                  </svg>
                  {isSubmitting ? 'Connexion en cours...' : 'Connecter avec MetaMask'}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  className={`mt-4 w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M169.209 25.951C95.12 37.992 36.096 97.013 24.051 171.105c-9.799 60.344 11.113 121.113 56.521 162.094 45.409 40.979 108.03 55.996 166.334 40.115 58.304-15.881 105.194-62.771 121.075-121.075 15.881-58.304.864-120.925-40.115-166.334C286.322 37.064 225.553 16.152 169.209 25.951zm-9.623 44.143c-24.249 8.723-44.384 26.811-56.037 50.244-11.652 23.433-13.66 50.285-5.607 75.033 8.054 24.748 25.607 45.358 48.756 57.19 23.149 11.832 49.968 14.156 74.865 6.467 24.897-7.689 45.884-24.773 58.371-47.546 12.487-22.773 15.12-49.542 7.31-74.54-7.81-24.998-24.994-46.142-47.842-58.764-22.848-12.622-49.667-15.407-74.666-7.717-1.717.528-3.417 1.107-5.1 1.736l-.05-.103z" />
                    <path fill="currentColor" d="M383.951 342.791c-74.089 12.041-133.113 71.062-145.158 145.154-9.799 60.344 11.113 121.113 56.521 162.094 45.409 40.979 108.03 55.996 166.334 40.115 58.304-15.881 105.194-62.771 121.075-121.075 15.881-58.304.864-120.925-40.115-166.334-40.981-45.408-101.75-66.32-158.094-56.521l-1.736 5.1c-7.69 24.999-4.905 51.818 7.717 74.666 12.622 22.848 33.766 40.032 58.764 47.842 24.998 7.81 51.767 5.177 74.54-7.31 22.773-12.487 39.857-33.474 47.546-58.371 7.689-24.897 5.365-51.716-6.467-74.865-11.832-23.149-32.442-40.702-57.19-48.756-24.748-8.053-51.6-6.045-75.033 5.607-23.433 11.653-41.521 31.788-50.244 56.037-.629 1.683-1.208 3.383-1.736 5.1l.103.05z" />
                  </svg>
                  Connecter avec WalletConnect
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Nouveau sur TokenForge?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
