import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/core/logger";

const AuthDemo: React.FC = () => {
  // États pour les formulaires
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  // Utilisation du hook useAuth
  const {
    user,
    status,
    error,
    isAuthenticated,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signInAnonymously,
    signOut,
    resetPassword,
    updateUserProfile,
  } = useAuth();

  // Gestionnaires d'événements pour les formulaires
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      // Réinitialiser le formulaire après connexion
      setEmail("");
      setPassword("");
    } catch (error) {
      // L'erreur est déjà gérée par le hook
      logger.debug({
        category: "AuthDemo",
        message: "Erreur gérée par le hook useAuth",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      // Réinitialiser le formulaire après inscription
      setEmail("");
      setPassword("");
    } catch (error) {
      // L'erreur est déjà gérée par le hook
      logger.debug({
        category: "AuthDemo",
        message: "Erreur gérée par le hook useAuth",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  const handleSignInAnonymously = async () => {
    try {
      await signInAnonymously();
    } catch (error) {
      // L'erreur est déjà gérée par le hook
      logger.debug({
        category: "AuthDemo",
        message: "Erreur gérée par le hook useAuth",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // L'erreur est déjà gérée par le hook
      logger.debug({
        category: "AuthDemo",
        message: "Erreur gérée par le hook useAuth",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({ displayName, photoURL: photoURL || undefined });
      // Réinitialiser le formulaire après mise à jour
      setDisplayName("");
      setPhotoURL("");
    } catch (error) {
      // L'erreur est déjà gérée par le hook
      logger.debug({
        category: "AuthDemo",
        message: "Erreur gérée par le hook useAuth",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(resetEmail);
      // Réinitialiser le formulaire après envoi de l'email
      setResetEmail("");
      alert("Un email de réinitialisation a été envoyé à votre adresse email.");
    } catch (error) {
      // L'erreur est déjà gérée par le hook
      logger.debug({
        category: "AuthDemo",
        message: "Erreur gérée par le hook useAuth",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  };

  // Rendu conditionnel en fonction de l'état d'authentification
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        Démonstration d'Authentification Firebase
      </h2>

      {/* Affichage de l'état d'authentification */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">État d'authentification</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Statut:</p>
            <p
              className={`text-sm ${
                status === "error" ? "text-red-500" : "text-gray-900"
              }`}
            >
              {status === "idle" && "En attente"}
              {status === "loading" && "Chargement..."}
              {status === "authenticated" && "Authentifié"}
              {status === "unauthenticated" && "Non authentifié"}
              {status === "error" && "Erreur"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Authentifié:</p>
            <p className="text-sm">
              {isAuthenticated ? (
                <span className="text-green-500">Oui</span>
              ) : (
                <span className="text-red-500">Non</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Admin:</p>
            <p className="text-sm">
              {isAdmin ? (
                <span className="text-green-500">Oui</span>
              ) : (
                <span className="text-red-500">Non</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Chargement:</p>
            <p className="text-sm">
              {isLoading ? (
                <span className="text-yellow-500">Oui</span>
              ) : (
                <span className="text-green-500">Non</span>
              )}
            </p>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">
            <p className="font-medium">Erreur:</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}
      </div>

      {/* Informations utilisateur */}
      {user && (
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h3 className="text-lg font-semibold mb-2">
            Informations utilisateur
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">UID:</p>
              <p className="text-sm text-gray-900">{user.uid}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Email:</p>
              <p className="text-sm text-gray-900">
                {user.email || "Non défini"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Nom d'affichage:
              </p>
              <p className="text-sm text-gray-900">
                {user.displayName || "Non défini"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Anonyme:</p>
              <p className="text-sm">
                {user.isAnonymous ? (
                  <span className="text-yellow-500">Oui</span>
                ) : (
                  <span className="text-green-500">Non</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Email vérifié:
              </p>
              <p className="text-sm">
                {user.emailVerified ? (
                  <span className="text-green-500">Oui</span>
                ) : (
                  <span className="text-red-500">Non</span>
                )}
              </p>
            </div>
            {user.photoURL && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-700">Photo:</p>
                <img
                  src={user.photoURL}
                  alt="Photo de profil"
                  className="w-16 h-16 mt-1 rounded-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulaires d'authentification */}
        {!isAuthenticated ? (
          <>
            {/* Connexion */}
            <div className="p-4 border rounded">
              <h3 className="text-lg font-semibold mb-4">Connexion</h3>
              <form onSubmit={handleSignIn}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </button>
              </form>
            </div>

            {/* Inscription */}
            <div className="p-4 border rounded">
              <h3 className="text-lg font-semibold mb-4">Inscription</h3>
              <form onSubmit={handleSignUp}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Inscription en cours..." : "S'inscrire"}
                </button>
              </form>

              {/* Connexion anonyme */}
              <div className="mt-4">
                <button
                  onClick={handleSignInAnonymously}
                  className="w-full py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion en cours..." : "Connexion anonyme"}
                </button>
              </div>
            </div>

            {/* Réinitialisation du mot de passe */}
            <div className="p-4 border rounded md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">
                Réinitialisation du mot de passe
              </h3>
              <form onSubmit={handleResetPassword}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-4 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-yellow-300"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Envoi en cours..."
                    : "Réinitialiser le mot de passe"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            {/* Mise à jour du profil */}
            <div className="p-4 border rounded">
              <h3 className="text-lg font-semibold mb-4">
                Mise à jour du profil
              </h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom d'affichage
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder={user?.displayName || "Non défini"}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de la photo
                  </label>
                  <input
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder={user?.photoURL || "Non défini"}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={isLoading || (!displayName && !photoURL)}
                >
                  {isLoading
                    ? "Mise à jour en cours..."
                    : "Mettre à jour le profil"}
                </button>
              </form>
            </div>

            {/* Déconnexion */}
            <div className="p-4 border rounded">
              <h3 className="text-lg font-semibold mb-4">Déconnexion</h3>
              <p className="mb-4 text-sm text-gray-600">
                Vous êtes actuellement connecté
                {user?.isAnonymous ? " anonymement" : ""}.
              </p>
              <button
                onClick={handleSignOut}
                className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                disabled={isLoading}
              >
                {isLoading ? "Déconnexion en cours..." : "Se déconnecter"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthDemo;
