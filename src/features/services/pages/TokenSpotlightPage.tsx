import React, { useState } from "react";
import { SEOHead } from "@/components";

export const TokenSpotlightPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("apply");

  // Données simulées pour les tokens en vedette
  const featuredTokens = [
    {
      id: "1",
      name: "GreenEnergy Token",
      symbol: "GET",
      logo: "/images/tokens/green-energy.png",
      category: "Environnement",
      description:
        "Token dédié au financement de projets d'énergie renouvelable et de compensation carbone.",
      website: "https://greenenergy.io",
      twitter: "@GreenEnergyToken",
      telegram: "t.me/greenenergy",
      marketCap: "$4.2M",
      volume24h: "$320K",
      holders: "2,450",
      launchDate: "15 Jan 2025",
      spotlight: {
        startDate: "1 Mar 2025",
        endDate: "31 Mar 2025",
        status: "Actif",
      },
    },
    {
      id: "2",
      name: "EduChain",
      symbol: "EDU",
      logo: "/images/tokens/educhain.png",
      category: "Éducation",
      description:
        "Plateforme blockchain pour la certification et la vérification des diplômes et certifications académiques.",
      website: "https://educhain.network",
      twitter: "@EduChainNetwork",
      telegram: "t.me/educhain",
      marketCap: "$2.8M",
      volume24h: "$150K",
      holders: "1,850",
      launchDate: "5 Feb 2025",
      spotlight: {
        startDate: "15 Mar 2025",
        endDate: "15 Apr 2025",
        status: "À venir",
      },
    },
    {
      id: "3",
      name: "HealthBlock",
      symbol: "HLT",
      logo: "/images/tokens/healthblock.png",
      category: "Santé",
      description:
        "Solution blockchain pour le partage sécurisé de données médicales et la gestion des dossiers de santé.",
      website: "https://healthblock.io",
      twitter: "@HealthBlock",
      telegram: "t.me/healthblock",
      marketCap: "$5.7M",
      volume24h: "$420K",
      holders: "3,100",
      launchDate: "20 Dec 2024",
      spotlight: {
        startDate: "1 Feb 2025",
        endDate: "28 Feb 2025",
        status: "Terminé",
      },
    },
  ];

  // Critères d'éligibilité
  const eligibilityCriteria = [
    {
      title: "Projet viable",
      description:
        "Votre token doit avoir un cas d'utilisation clair et un modèle économique viable.",
      icon: "📝",
    },
    {
      title: "Équipe vérifiée",
      description:
        "L'équipe doit être transparente et avoir passé une vérification KYC.",
      icon: "👥",
    },
    {
      title: "Audit de sécurité",
      description:
        "Les smart contracts doivent avoir été audités par une entreprise reconnue.",
      icon: "🔒",
    },
    {
      title: "Communauté active",
      description:
        "Une communauté engagée d'au moins 1000 membres sur les réseaux sociaux.",
      icon: "🌐",
    },
    {
      title: "Liquidité verrouillée",
      description:
        "La liquidité doit être verrouillée pour une période minimale de 6 mois.",
      icon: "🔐",
    },
    {
      title: "Tokenomics sains",
      description:
        "Distribution équitable des tokens et mécanismes anti-dumping.",
      icon: "📊",
    },
  ];

  // Avantages du programme
  const programBenefits = [
    {
      title: "Visibilité accrue",
      description:
        "Mise en avant sur la page d'accueil de TokenForge et dans nos newsletters.",
      icon: "🔍",
    },
    {
      title: "Accès aux investisseurs",
      description:
        "Présentation à notre réseau d'investisseurs et de fonds de capital-risque.",
      icon: "💰",
    },
    {
      title: "Support marketing",
      description:
        "Campagnes marketing dédiées et relais sur nos réseaux sociaux.",
      icon: "📣",
    },
    {
      title: "Intégrations DeFi",
      description:
        "Assistance pour l'intégration avec les principaux protocoles DeFi.",
      icon: "🔄",
    },
    {
      title: "Conseil stratégique",
      description:
        "Sessions de conseil avec nos experts en tokenomics et croissance.",
      icon: "🧠",
    },
    {
      title: "Badge de confiance",
      description:
        'Badge "TokenForge Spotlight" pour renforcer la crédibilité de votre projet.',
      icon: "✅",
    },
  ];

  return (
    <>
      <SEOHead
        title="Token Spotlight Program - TokenForge"
        description="Mettez en avant votre token et gagnez en visibilité grâce au programme Token Spotlight de TokenForge."
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Token Spotlight Program
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Propulsez votre token vers de nouveaux sommets grâce à notre
              programme de mise en avant exclusive.
            </p>
          </div>

          {/* Onglets */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                className={`px-5 py-2.5 text-sm font-medium rounded-l-lg ${
                  activeTab === "featured"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setActiveTab("featured")}
              >
                Tokens en vedette
              </button>
              <button
                type="button"
                className={`px-5 py-2.5 text-sm font-medium ${
                  activeTab === "apply"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setActiveTab("apply")}
              >
                Postuler au programme
              </button>
              <button
                type="button"
                className={`px-5 py-2.5 text-sm font-medium rounded-r-lg ${
                  activeTab === "about"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setActiveTab("about")}
              >
                À propos du programme
              </button>
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {/* Tokens en vedette */}
            {activeTab === "featured" && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Tokens actuellement en vedette
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredTokens.map((token) => (
                    <div
                      key={token.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
                              {token.symbol.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {token.name} ({token.symbol})
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {token.category}
                            </span>
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                token.spotlight.status === "Actif"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : token.spotlight.status === "À venir"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {token.spotlight.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {token.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Market Cap:{" "}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {token.marketCap}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Volume 24h:{" "}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {token.volume24h}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Détenteurs:{" "}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {token.holders}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Lancement:{" "}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {token.launchDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <a
                              href={token.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Site Web
                            </a>
                            <a
                              href={`https://twitter.com/${token.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Twitter
                            </a>
                            <a
                              href={`https://${token.telegram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Telegram
                            </a>
                          </div>
                          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                            Détails
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Postuler au programme */}
            {activeTab === "apply" && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Postuler au Token Spotlight Program
                </h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <p className="text-blue-700 dark:text-blue-300">
                    Remplissez le formulaire ci-dessous pour soumettre votre
                    token au programme Spotlight. Notre équipe examinera votre
                    candidature et vous contactera dans un délai de 5 jours
                    ouvrables.
                  </p>
                </div>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="tokenName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Nom du token
                      </label>
                      <input
                        type="text"
                        id="tokenName"
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: GreenEnergy Token"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tokenSymbol"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Symbole du token
                      </label>
                      <input
                        type="text"
                        id="tokenSymbol"
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: GET"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tokenAddress"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Adresse du contrat
                      </label>
                      <input
                        type="text"
                        id="tokenAddress"
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: 0x1234..."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tokenCategory"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Catégorie
                      </label>
                      <select
                        id="tokenCategory"
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        <option value="defi">DeFi</option>
                        <option value="nft">NFT</option>
                        <option value="gaming">Gaming</option>
                        <option value="metaverse">Metaverse</option>
                        <option value="environment">Environnement</option>
                        <option value="social">Social</option>
                        <option value="education">Éducation</option>
                        <option value="health">Santé</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label
                        htmlFor="tokenDescription"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Description du projet
                      </label>
                      <textarea
                        id="tokenDescription"
                        rows={4}
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Décrivez votre projet, son cas d'utilisation et sa proposition de valeur..."
                      ></textarea>
                    </div>
                    <div>
                      <label
                        htmlFor="tokenWebsite"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Site Web
                      </label>
                      <input
                        type="url"
                        id="tokenWebsite"
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tokenWhitepaper"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Lien vers le whitepaper
                      </label>
                      <input
                        type="url"
                        id="tokenWhitepaper"
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tokenTwitter"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Twitter
                      </label>
                      <input
                        type="text"
                        id="tokenTwitter"
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="@..."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tokenTelegram"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Telegram
                      </label>
                      <input
                        type="text"
                        id="tokenTelegram"
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="t.me/..."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tokenLaunchDate"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Date de lancement
                      </label>
                      <input
                        type="date"
                        id="tokenLaunchDate"
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tokenAudit"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Lien vers l'audit de sécurité
                      </label>
                      <input
                        type="url"
                        id="tokenAudit"
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label
                        htmlFor="additionalInfo"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Informations complémentaires
                      </label>
                      <textarea
                        id="additionalInfo"
                        rows={3}
                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Toute information supplémentaire que vous souhaitez partager..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Soumettre la candidature
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* À propos du programme */}
            {activeTab === "about" && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  À propos du Token Spotlight Program
                </h2>
                <div className="prose prose-blue max-w-none dark:prose-invert">
                  <p>
                    Le programme Token Spotlight de TokenForge est conçu pour
                    mettre en avant les projets blockchain les plus prometteurs
                    et innovants. Chaque mois, nous sélectionnons un nombre
                    limité de tokens qui bénéficieront d'une visibilité accrue
                    auprès de notre communauté et de notre réseau
                    d'investisseurs.
                  </p>
                  <p>
                    Notre objectif est de créer un pont entre les projets de
                    qualité et les utilisateurs à la recherche d'opportunités
                    d'investissement fiables. Tous les projets présentés dans
                    notre programme ont fait l'objet d'une vérification
                    approfondie par notre équipe.
                  </p>

                  <h3 className="text-xl font-semibold mt-8 mb-4">
                    Critères d'éligibilité
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {eligibilityCriteria.map((criteria, index) => (
                      <div key={index} className="flex">
                        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-2xl">
                          {criteria.icon}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {criteria.title}
                          </h4>
                          <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {criteria.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold mt-8 mb-4">
                    Avantages du programme
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {programBenefits.map((benefit, index) => (
                      <div key={index} className="flex">
                        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-2xl">
                          {benefit.icon}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {benefit.title}
                          </h4>
                          <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold mt-8 mb-4">
                    Processus de sélection
                  </h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Soumission de la candidature via le formulaire en ligne
                    </li>
                    <li>Examen initial par l'équipe TokenForge (1-2 jours)</li>
                    <li>
                      Vérification approfondie du projet et de l'équipe (2-3
                      jours)
                    </li>
                    <li>
                      Entretien avec les fondateurs du projet (si nécessaire)
                    </li>
                    <li>Décision finale et notification</li>
                    <li>
                      Intégration au programme et mise en place des actions
                      promotionnelles
                    </li>
                  </ol>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-8">
                    <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300">
                      Note importante
                    </h4>
                    <p className="mt-1 text-yellow-700 dark:text-yellow-200">
                      La participation au programme Token Spotlight n'est pas
                      une garantie de succès pour votre projet. TokenForge ne
                      fournit pas de conseils financiers et n'encourage pas
                      l'achat de tokens spécifiques. Les utilisateurs doivent
                      toujours effectuer leurs propres recherches avant
                      d'investir.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TokenSpotlightPage;
