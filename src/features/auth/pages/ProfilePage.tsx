import React, { useState } from 'react';
import { SEOHead } from '@/components';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  walletAddress: string;
  createdAt: string;
  twoFactorEnabled: boolean;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    securityAlerts: boolean;
    marketingUpdates: boolean;
    weeklyDigest: boolean;
  };
}

export const ProfilePage: React.FC = () => {
  // Données utilisateur simulées
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user123',
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    avatar: '/images/avatars/default.jpg',
    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    createdAt: '2024-12-15T10:30:00Z',
    twoFactorEnabled: false,
    notificationPreferences: {
      email: true,
      push: true,
      securityAlerts: true,
      marketingUpdates: false,
      weeklyDigest: true,
    },
  });

  // États pour les formulaires
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isManagingNotifications, setIsManagingNotifications] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: profile.notificationPreferences.email,
    push: profile.notificationPreferences.push,
    securityAlerts: profile.notificationPreferences.securityAlerts,
    marketingUpdates: profile.notificationPreferences.marketingUpdates,
    weeklyDigest: profile.notificationPreferences.weeklyDigest,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formatage de l'adresse wallet
  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Gestion des changements dans les formulaires
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Soumission du formulaire de profil
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Simulation d'une mise à jour de profil
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mise à jour du profil
      setProfile(prev => ({
        ...prev,
        name: formData.name,
        email: formData.email,
      }));

      setSuccessMessage('Profil mis à jour avec succès');
      setIsEditingProfile(false);
    } catch (error) {
      setErrorMessage('Une erreur est survenue lors de la mise à jour du profil');
    }
  };

  // Soumission du formulaire de changement de mot de passe
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validation des mots de passe
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.newPassword.length < 8) {
      setErrorMessage('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      // Simulation d'un changement de mot de passe
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('Mot de passe modifié avec succès');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setIsChangingPassword(false);
    } catch (error) {
      setErrorMessage('Une erreur est survenue lors du changement de mot de passe');
    }
  };

  // Soumission du formulaire de préférences de notification
  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Simulation d'une mise à jour des préférences
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mise à jour des préférences
      setProfile(prev => ({
        ...prev,
        notificationPreferences: {
          email: formData.emailNotifications,
          push: formData.push,
          securityAlerts: formData.securityAlerts,
          marketingUpdates: formData.marketingUpdates,
          weeklyDigest: formData.weeklyDigest,
        },
      }));

      setSuccessMessage('Préférences de notification mises à jour avec succès');
      setIsManagingNotifications(false);
    } catch (error) {
      setErrorMessage('Une erreur est survenue lors de la mise à jour des préférences');
    }
  };

  // Activation/désactivation de l'authentification à deux facteurs
  const handleToggle2FA = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Simulation d'une mise à jour de l'authentification à deux facteurs
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mise à jour du profil
      setProfile(prev => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled,
      }));

      setSuccessMessage(`Authentification à deux facteurs ${profile.twoFactorEnabled ? 'désactivée' : 'activée'} avec succès`);
    } catch (error) {
      setErrorMessage('Une erreur est survenue lors de la mise à jour de l\'authentification à deux facteurs');
    }
  };

  return (
    <>
      <SEOHead
        title="Mon Profil - TokenForge"
        description="Gérez votre profil et vos préférences sur TokenForge"
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Mon Profil</h1>

            {/* Messages de succès et d'erreur */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md">
                {errorMessage}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
              {/* En-tête du profil */}
              <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center">
                  <div className="h-24 w-24 rounded-full bg-gray-300 dark:bg-gray-700 mb-4 sm:mb-0 sm:mr-6 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <span>Avatar</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Membre depuis {formatDate(profile.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations du profil */}
              <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informations personnelles</h3>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {isEditingProfile ? 'Annuler' : 'Modifier'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Adresse email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</p>
                        <p className="mt-1 text-gray-900 dark:text-white">{profile.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                        <p className="mt-1 text-gray-900 dark:text-white">{profile.email}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse wallet</p>
                      <p className="mt-1 text-gray-900 dark:text-white font-mono">
                        {formatWalletAddress(profile.walletAddress)}
                        <button
                          onClick={() => navigator.clipboard.writeText(profile.walletAddress)}
                          className="ml-2 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                        >
                          Copier
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sécurité */}
              <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sécurité</h3>
                  <button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {isChangingPassword ? 'Annuler' : 'Changer le mot de passe'}
                  </button>
                </div>

                {isChangingPassword ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Mettre à jour le mot de passe
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Authentification à deux facteurs</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {profile.twoFactorEnabled
                            ? 'Activée - Votre compte est sécurisé avec l\'authentification à deux facteurs'
                            : 'Désactivée - Activez l\'authentification à deux facteurs pour une sécurité renforcée'}
                        </p>
                      </div>
                      <button
                        onClick={handleToggle2FA}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${profile.twoFactorEnabled
                          ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                          : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                          }`}
                      >
                        {profile.twoFactorEnabled ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Dernière connexion</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Aujourd'hui à 08:45 depuis Paris, France</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Préférences de notification */}
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Préférences de notification</h3>
                  <button
                    onClick={() => setIsManagingNotifications(!isManagingNotifications)}
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {isManagingNotifications ? 'Annuler' : 'Gérer'}
                  </button>
                </div>

                {isManagingNotifications ? (
                  <form onSubmit={handleNotificationsSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="emailNotifications"
                            name="emailNotifications"
                            type="checkbox"
                            checked={formData.emailNotifications}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="emailNotifications" className="font-medium text-gray-700 dark:text-gray-300">Notifications par email</label>
                          <p className="text-gray-500 dark:text-gray-400">Recevoir des notifications par email pour les mises à jour importantes</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="push"
                            name="push"
                            type="checkbox"
                            checked={formData.push}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="push" className="font-medium text-gray-700 dark:text-gray-300">Notifications push</label>
                          <p className="text-gray-500 dark:text-gray-400">Recevoir des notifications push sur votre navigateur</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="securityAlerts"
                            name="securityAlerts"
                            type="checkbox"
                            checked={formData.securityAlerts}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="securityAlerts" className="font-medium text-gray-700 dark:text-gray-300">Alertes de sécurité</label>
                          <p className="text-gray-500 dark:text-gray-400">Recevoir des alertes pour les activités suspectes</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="marketingUpdates"
                            name="marketingUpdates"
                            type="checkbox"
                            checked={formData.marketingUpdates}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="marketingUpdates" className="font-medium text-gray-700 dark:text-gray-300">Mises à jour marketing</label>
                          <p className="text-gray-500 dark:text-gray-400">Recevoir des informations sur les nouvelles fonctionnalités et offres</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="weeklyDigest"
                            name="weeklyDigest"
                            type="checkbox"
                            checked={formData.weeklyDigest}
                            onChange={handleChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="weeklyDigest" className="font-medium text-gray-700 dark:text-gray-300">Résumé hebdomadaire</label>
                          <p className="text-gray-500 dark:text-gray-400">Recevoir un résumé hebdomadaire de vos activités</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Enregistrer les préférences
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="mt-1 text-gray-900 dark:text-white">{profile.notificationPreferences.email ? 'Activé' : 'Désactivé'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Push</p>
                      <p className="mt-1 text-gray-900 dark:text-white">{profile.notificationPreferences.push ? 'Activé' : 'Désactivé'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Alertes de sécurité</p>
                      <p className="mt-1 text-gray-900 dark:text-white">{profile.notificationPreferences.securityAlerts ? 'Activé' : 'Désactivé'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mises à jour marketing</p>
                      <p className="mt-1 text-gray-900 dark:text-white">{profile.notificationPreferences.marketingUpdates ? 'Activé' : 'Désactivé'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Résumé hebdomadaire</p>
                      <p className="mt-1 text-gray-900 dark:text-white">{profile.notificationPreferences.weeklyDigest ? 'Activé' : 'Désactivé'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions de compte */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sm:p-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actions de compte</h3>
              <div className="space-y-4">
                <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
                  Déconnecter tous les appareils
                </button>
                <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
