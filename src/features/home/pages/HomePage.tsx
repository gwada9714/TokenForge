import React from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components";

export const HomePage: React.FC = () => {
  // Statistiques simulées
  const stats = {
    tokensCreated: 12458,
    activeUsers: 8742,
    averageSavings: 32, // pourcentage
    averageDeployTime: "2.5 minutes",
  };

  // Témoignages simulés
  const testimonials = [
    {
      id: 1,
      name: "Sophie Martin",
      role: "Fondatrice de CryptoStart",
      image: "/images/testimonials/sophie-martin.jpg",
      quote:
        "TokenForge nous a permis de lancer notre token en quelques minutes, sans connaissances techniques préalables. Le support est exceptionnel !",
      rating: 5,
      project: "CryptoStart Token (CST)",
    },
    {
      id: 2,
      name: "Thomas Dubois",
      role: "CTO de GameChain",
      image: "/images/testimonials/thomas-dubois.jpg",
      quote:
        "Les fonctionnalités anti-rugpull ont été déterminantes pour gagner la confiance de notre communauté. Nous avons économisé 40% par rapport à d'autres solutions.",
      rating: 5,
      project: "GameChain Token (GCT)",
    },
    {
      id: 3,
      name: "Julie Lefebvre",
      role: "Responsable Marketing chez DecentraHealth",
      image: "/images/testimonials/julie-lefebvre.jpg",
      quote:
        "L'interface intuitive et les templates prédéfinis nous ont fait gagner un temps précieux. Le déploiement multi-chain a été un jeu d'enfant.",
      rating: 4,
      project: "DecentraHealth Token (DHT)",
    },
  ];

  // Fonctionnalités principales
  const features = [
    {
      title: "Multi-Chain",
      description:
        "Déployez sur 6+ blockchains (Ethereum, BSC, Polygon, Avalanche, Solana, Arbitrum)",
      icon: "🔗",
    },
    {
      title: "Anti-Rugpull",
      description:
        "Protégez votre communauté avec des mécanismes de sécurité avancés",
      icon: "🛡️",
    },
    {
      title: "Économies",
      description: "Tarifs 20-40% inférieurs à la concurrence",
      icon: "💰",
    },
    {
      title: "Simplicité",
      description: "Interface intuitive, accessible aux non-techniciens",
      icon: "🔍",
    },
    {
      title: "Tokenomics",
      description: "Outils avancés de conception et simulation économique",
      icon: "📊",
    },
    {
      title: "Templates",
      description: "Modèles prédéfinis pour tous les cas d'usage",
      icon: "📝",
    },
  ];

  // Plans tarifaires
  const plans = [
    {
      name: "Free",
      price: "0€",
      features: [
        "Création basique sur 2 blockchains",
        "Templates standards",
        "Support communautaire",
        "Documentation complète",
      ],
      cta: "Commencer gratuitement",
      popular: false,
    },
    {
      name: "Basic",
      price: "99€",
      features: [
        "Création sur 4 blockchains",
        "Fonctionnalités standard",
        "Support email",
        "Anti-Rugpull basique",
        "Analytics de base",
      ],
      cta: "Choisir Basic",
      popular: true,
    },
    {
      name: "Pro",
      price: "299€",
      features: [
        "Toutes les blockchains (6+)",
        "Fonctionnalités avancées",
        "Support prioritaire",
        "Anti-Rugpull avancé",
        "Analytics détaillés",
        "Multi-signature",
      ],
      cta: "Choisir Pro",
      popular: false,
    },
  ];

  // Rendu des étoiles pour les témoignages
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        className={`h-5 w-5 ${
          index < rating
            ? "text-yellow-400"
            : "text-gray-300 dark:text-gray-600"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <>
      <SEOHead
        title="TokenForge - Créez votre token en quelques minutes"
        description="Plateforme de création de tokens multi-chain simple, sécurisée et économique. Déployez sur Ethereum, BSC, Polygon et plus encore."
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
                Créez votre token en quelques minutes
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Plateforme simple, sécurisée et économique pour déployer des
                tokens sur 6+ blockchains sans connaissances techniques.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/create-token"
                  className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Créer un token
                </Link>
                <Link
                  to="/token-templates"
                  className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg border border-blue-500 hover:bg-blue-600 transition-colors"
                >
                  Explorer les templates
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl">
                <div className="aspect-video bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Vidéo de démonstration</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">
                Économisez jusqu'à 40% vs concurrents
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.tokensCreated.toLocaleString()}+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Tokens créés
              </div>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.activeUsers.toLocaleString()}+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Utilisateurs actifs
              </div>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.averageSavings}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Économies moyennes
              </div>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.averageDeployTime}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Temps de déploiement
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi choisir TokenForge ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Notre plateforme combine simplicité, sécurité et économies pour
              vous offrir la meilleure expérience de création de tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Découvrez comment TokenForge aide les entrepreneurs et
              développeurs à lancer leurs projets blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl"
              >
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700 mr-4 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <span>Photo</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  "{testimonial.quote}"
                </p>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Projet : {testimonial.project}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans tarifaires */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Plans tarifaires transparents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Économisez jusqu'à 40% par rapport à nos concurrents avec nos
              tarifs avantageux.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden ${
                  plan.popular
                    ? "ring-2 ring-blue-500 dark:ring-blue-400 relative"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-sm font-medium py-1 text-center">
                    Le plus populaire
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    {plan.price}
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center text-gray-600 dark:text-gray-300"
                      >
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/plans"
                    className={`block text-center py-2 px-4 rounded-lg font-medium ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Prêt à lancer votre token ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Rejoignez plus de 8,000 entrepreneurs et développeurs qui font
            confiance à TokenForge pour leurs projets blockchain.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/create-token"
              className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Créer un token
            </Link>
            <Link
              to="/token-templates"
              className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg border border-blue-500 hover:bg-blue-600 transition-colors"
            >
              Explorer les templates
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
