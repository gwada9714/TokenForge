import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components";

export const RecoverAccountPage: React.FC = () => {
  const [step, setStep] = useState<"email" | "verification" | "reset">("email");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Simulation d'envoi d'email (à remplacer par l'appel API réel)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep("verification");
    } catch (err) {
      setError(
        "Une erreur est survenue lors de l'envoi de l'email. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Simulation de vérification (à remplacer par l'appel API réel)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep("reset");
    } catch (err) {
      setError("Le code de vérification est invalide. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Simulation de réinitialisation (à remplacer par l'appel API réel)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      setError(
        "Une erreur est survenue lors de la réinitialisation du mot de passe. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Adresse email
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="john.doe@example.com"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting
            ? "Envoi en cours..."
            : "Envoyer le lien de récupération"}
        </button>
      </div>
    </form>
  );

  const renderVerificationStep = () => (
    <form onSubmit={handleVerificationSubmit} className="space-y-6">
      <div>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Un code de vérification a été envoyé à <strong>{email}</strong>.
          Veuillez entrer ce code ci-dessous.
        </p>
        <label
          htmlFor="verificationCode"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Code de vérification
        </label>
        <div className="mt-1">
          <input
            id="verificationCode"
            name="verificationCode"
            type="text"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="123456"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep("email")}
          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Vérification..." : "Vérifier"}
        </button>
      </div>
    </form>
  );

  const renderResetStep = () => (
    <form onSubmit={handleResetSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Nouveau mot de passe
        </label>
        <div className="mt-1">
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="••••••••"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Minimum 8 caractères, incluant lettres, chiffres et caractères
          spéciaux
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Confirmer le mot de passe
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep("verification")}
          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting
            ? "Réinitialisation..."
            : "Réinitialiser le mot de passe"}
        </button>
      </div>
    </form>
  );

  const renderSuccessMessage = () => (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
        <svg
          className="h-6 w-6 text-green-600 dark:text-green-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        Mot de passe réinitialisé !
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        Votre mot de passe a été réinitialisé avec succès. Vous pouvez
        maintenant vous connecter avec votre nouveau mot de passe.
      </p>
      <div className="mt-6">
        <Link
          to="/login"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Aller à la page de connexion
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead
        title="Récupération de compte - TokenForge"
        description="Réinitialisez votre mot de passe ou récupérez l'accès à votre compte TokenForge."
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Récupération de compte
            </h1>
            {!success && (
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Réinitialisez votre mot de passe ou récupérez l'accès à votre
                compte
              </p>
            )}
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            {success ? (
              renderSuccessMessage()
            ) : (
              <>
                {step === "email" && renderEmailStep()}
                {step === "verification" && renderVerificationStep()}
                {step === "reset" && renderResetStep()}
              </>
            )}
          </div>

          {!success && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vous vous souvenez de votre mot de passe ?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Connectez-vous
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
