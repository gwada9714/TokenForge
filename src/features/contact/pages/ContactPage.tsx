import React, { useState } from "react";
import { SEOHead } from "@/components";

export const ContactPage: React.FC = () => {
  // États pour le formulaire
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    department: "support",
    message: "",
    gdprConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Gestion des changements dans le formulaire
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestion du changement de la case à cocher RGPD
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    // Simulation d'envoi de formulaire (à remplacer par l'appel API réel)
    try {
      // Simuler un délai d'envoi
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simuler une réponse réussie
      setSubmitResult({
        success: true,
        message:
          "Votre message a été envoyé avec succès. Notre équipe vous répondra dans les plus brefs délais.",
      });

      // Réinitialiser le formulaire après succès
      setFormData({
        name: "",
        email: "",
        subject: "",
        department: "support",
        message: "",
        gdprConsent: false,
      });
    } catch (error) {
      // Gérer les erreurs
      setSubmitResult({
        success: false,
        message:
          "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer ultérieurement.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Contact & Support - TokenForge"
        description="Contactez l'équipe TokenForge pour toute question, assistance technique ou demande de partenariat. Notre équipe est à votre disposition."
      />

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-4">Contact & Support</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Nous sommes là pour vous aider. Utilisez le formulaire ci-dessous
            pour nous contacter ou consultez nos autres canaux de support.
          </p>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Formulaire de contact */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Envoyez-nous un message
              </h2>

              {submitResult && (
                <div
                  className={`mb-6 p-4 rounded-md ${
                    submitResult.success
                      ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                      : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                  }`}
                >
                  {submitResult.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Sujet *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Département
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="support">Support Technique</option>
                    <option value="sales">Ventes & Abonnements</option>
                    <option value="partnership">Partenariats</option>
                    <option value="legal">Questions Légales</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  ></textarea>
                </div>

                <div className="mb-6">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="gdprConsent"
                      name="gdprConsent"
                      checked={formData.gdprConsent}
                      onChange={handleCheckboxChange}
                      required
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="gdprConsent"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      J'accepte que mes données soient traitées conformément à
                      la
                      <a
                        href="/privacy-policy"
                        className="text-blue-600 hover:underline ml-1"
                      >
                        politique de confidentialité
                      </a>
                      . *
                    </label>
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
                    {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Informations de contact et autres canaux */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Chat en Direct</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Notre chat en direct est disponible 24/7 pour répondre à vos
                questions immédiates.
              </p>
              <button
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                onClick={() => alert("Fonctionnalité de chat à implémenter")}
              >
                Démarrer un chat
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Communauté</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Rejoignez notre communauté pour obtenir de l'aide et partager
                vos expériences.
              </p>
              <div className="space-y-3">
                <a
                  href="https://discord.gg/tokenforge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  Discord
                </a>
                <a
                  href="https://t.me/tokenforge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.5 6.484-.5 6.484s-.014.151-.056.226a.335.335 0 0 1-.168.181c-.059.029-.12.05-.195.05-.1 0-.148-.018-.175-.028l-2.883-1.896c-.346.327-1.02.967-1.093 1.033-.082.074-.177.113-.283.113a.657.657 0 0 1-.113-.013c-.04-.008-.121-.045-.371-.188-.248-.143-1.538-.911-1.538-.911l-.456.473s-.21.138-.336.138a.373.373 0 0 1-.149-.03c-.134-.058-.219-.193-.244-.262-.025-.069-.494-1.669-.494-1.669l-2.294-1.47s-.129-.09-.156-.185c-.027-.095.026-.175.026-.175s.442-.403.878-.788c1.375-1.222 1.826-1.61 1.896-1.673.05-.045.12-.08.195-.08.129 0 .21.076.256.1l.113.06c.113.06 2.14 1.405 2.14 1.405l.446-.327s.065-.052.134-.052c.056 0 .114.026.159.066.094.084.118.247.118.247l.446 2.904c.047.288.1.645.147.935.047.29.099.58.146.871.047.29.09.57.135.847l.015.09c.024.15.031.19.079.24a.18.18 0 0 0 .134.064c.05 0 .103-.02.151-.057l1.868-1.742 2.836 2.134s.096.06.156.06c.066 0 .123-.033.155-.09.032-.056.05-.18.05-.18l.932-7.38c.01-.08.024-.197.024-.294 0-.09-.024-.176-.046-.233-.023-.058-.089-.145-.145-.183-.057-.037-.11-.06-.219-.06-.005 0-.01 0-.015 0z" />
                  </svg>
                  Telegram
                </a>
                <a
                  href="https://twitter.com/tokenforge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Twitter/X
                </a>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Base de Connaissances
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Consultez notre documentation complète pour trouver des réponses
                à vos questions.
              </p>
              <a
                href="/knowledge-base"
                className="block w-full text-center py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors"
              >
                Accéder à la documentation
              </a>
            </div>
          </div>
        </div>

        {/* Section FAQ */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Questions Fréquentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">
                Quel est le délai de réponse?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Nous nous efforçons de répondre à toutes les demandes dans un
                délai de 24 heures ouvrables. Les clients des plans Pro et
                Enterprise bénéficient d'un support prioritaire.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">
                Comment créer un ticket de support?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Les utilisateurs connectés peuvent créer un ticket directement
                depuis leur tableau de bord. Vous pouvez également utiliser ce
                formulaire de contact pour ouvrir un ticket.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">
                Proposez-vous un support téléphonique?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Le support téléphonique est disponible pour les clients
                Enterprise. Pour les autres plans, nous offrons un support par
                email, chat et tickets.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">
                Comment devenir partenaire?
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Pour discuter d'opportunités de partenariat, veuillez utiliser
                ce formulaire en sélectionnant "Partenariats" comme département.
                Notre équipe vous contactera pour discuter des possibilités.
              </p>
            </div>
          </div>
          <div className="text-center mt-6">
            <a href="/faq" className="text-blue-600 hover:underline">
              Voir toutes les questions fréquentes →
            </a>
          </div>
        </section>
      </main>
    </>
  );
};
