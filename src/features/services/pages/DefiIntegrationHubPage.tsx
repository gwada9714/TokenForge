import React, { useState } from "react";
import { SEOHead } from "@/components";

export const DefiIntegrationHubPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Catégories d'intégrations
  const categories = [
    { id: "all", name: "Toutes les intégrations" },
    { id: "dex", name: "Échanges décentralisés (DEX)" },
    { id: "lending", name: "Prêts & Emprunts" },
    { id: "yield", name: "Yield Farming" },
    { id: "bridge", name: "Cross-Chain Bridges" },
    { id: "oracle", name: "Oracles" },
    { id: "analytics", name: "Analytics" },
  ];

  // Interface pour les intégrations
  interface Integration {
    id: string;
    name: string;
    category: string;
    description: string;
    features: string[];
    chains: string[];
    logo: string;
    website: string;
    documentation: string;
    popularity: number;
    complexity: "Facile" | "Moyenne" | "Avancée";
    status: "Actif" | "Bêta" | "En développement";
  }

  // Liste des intégrations (données simulées)
  const integrations: Integration[] = [
    {
      id: "1",
      name: "UniSwap V3",
      category: "dex",
      description:
        "Intégrez votre token dans le plus grand échange décentralisé sur Ethereum et autres chaînes compatibles EVM.",
      features: [
        "Création de pool de liquidité",
        "Concentration de liquidité",
        "Frais personnalisables",
        "Intégration de widget de swap",
      ],
      chains: ["Ethereum", "Polygon", "Arbitrum", "Optimism"],
      logo: "/images/integrations/uniswap.svg",
      website: "https://uniswap.org",
      documentation: "https://docs.uniswap.org",
      popularity: 95,
      complexity: "Moyenne",
      status: "Actif",
    },
    {
      id: "2",
      name: "Aave V3",
      category: "lending",
      description:
        "Permettez aux détenteurs de votre token de prêter et emprunter via le protocole de prêt décentralisé leader du marché.",
      features: [
        "Marchés de prêt",
        "Taux d'intérêt variables et stables",
        "Collatéralisation",
        "Liquidations automatiques",
      ],
      chains: ["Ethereum", "Polygon", "Avalanche", "Arbitrum", "Optimism"],
      logo: "/images/integrations/aave.svg",
      website: "https://aave.com",
      documentation: "https://docs.aave.com",
      popularity: 90,
      complexity: "Avancée",
      status: "Actif",
    },
    {
      id: "3",
      name: "Chainlink",
      category: "oracle",
      description:
        "Intégrez des oracles décentralisés pour fournir des données fiables à vos smart contracts.",
      features: [
        "Flux de prix",
        "Générateur de nombres aléatoires vérifiable (VRF)",
        "Automatisation",
        "Cross-chain interoperability",
      ],
      chains: [
        "Ethereum",
        "BNB Chain",
        "Polygon",
        "Avalanche",
        "Arbitrum",
        "Optimism",
        "Solana",
      ],
      logo: "/images/integrations/chainlink.svg",
      website: "https://chain.link",
      documentation: "https://docs.chain.link",
      popularity: 92,
      complexity: "Moyenne",
      status: "Actif",
    },
    {
      id: "4",
      name: "Compound V3",
      category: "lending",
      description:
        "Protocole de prêt décentralisé permettant aux utilisateurs de prêter et d'emprunter des actifs.",
      features: [
        "Marchés de prêt",
        "Taux d'intérêt algorithmiques",
        "Collatéralisation",
        "Gouvernance décentralisée",
      ],
      chains: ["Ethereum", "Polygon", "Arbitrum"],
      logo: "/images/integrations/compound.svg",
      website: "https://compound.finance",
      documentation: "https://docs.compound.finance",
      popularity: 85,
      complexity: "Moyenne",
      status: "Actif",
    },
    {
      id: "5",
      name: "Curve Finance",
      category: "dex",
      description:
        "DEX optimisé pour l'échange efficace de stablecoins et d'actifs similaires.",
      features: [
        "Pools de liquidité à faible slippage",
        "Frais réduits",
        "Optimisé pour les stablecoins",
        "Yield farming via Curve DAO",
      ],
      chains: [
        "Ethereum",
        "Polygon",
        "Avalanche",
        "Arbitrum",
        "Optimism",
        "Fantom",
      ],
      logo: "/images/integrations/curve.svg",
      website: "https://curve.fi",
      documentation: "https://resources.curve.fi",
      popularity: 88,
      complexity: "Avancée",
      status: "Actif",
    },
    {
      id: "6",
      name: "Yearn Finance",
      category: "yield",
      description:
        "Agrégateur de rendement DeFi qui optimise automatiquement les stratégies de yield farming.",
      features: [
        "Vaults automatisés",
        "Stratégies de rendement optimisées",
        "Diversification des risques",
        "Composabilité avec d'autres protocoles DeFi",
      ],
      chains: ["Ethereum", "Fantom", "Arbitrum"],
      logo: "/images/integrations/yearn.svg",
      website: "https://yearn.finance",
      documentation: "https://docs.yearn.finance",
      popularity: 82,
      complexity: "Avancée",
      status: "Actif",
    },
    {
      id: "7",
      name: "Wormhole",
      category: "bridge",
      description:
        "Protocole de messagerie cross-chain permettant le transfert d'actifs et de messages entre blockchains.",
      features: [
        "Transfert d'actifs cross-chain",
        "Messagerie cross-chain",
        "Support multi-chaînes",
        "Sécurité via gardiens",
      ],
      chains: [
        "Ethereum",
        "Solana",
        "BNB Chain",
        "Polygon",
        "Avalanche",
        "Arbitrum",
        "Optimism",
      ],
      logo: "/images/integrations/wormhole.svg",
      website: "https://wormhole.com",
      documentation: "https://docs.wormhole.com",
      popularity: 80,
      complexity: "Avancée",
      status: "Actif",
    },
    {
      id: "8",
      name: "The Graph",
      category: "analytics",
      description:
        "Protocole d'indexation décentralisé pour organiser les données blockchain et les rendre facilement accessibles.",
      features: [
        "Indexation de données blockchain",
        "API GraphQL",
        "Subgraphs personnalisables",
        "Requêtes complexes",
      ],
      chains: [
        "Ethereum",
        "BNB Chain",
        "Polygon",
        "Avalanche",
        "Arbitrum",
        "Optimism",
        "Celo",
      ],
      logo: "/images/integrations/thegraph.svg",
      website: "https://thegraph.com",
      documentation: "https://thegraph.com/docs",
      popularity: 87,
      complexity: "Moyenne",
      status: "Actif",
    },
  ];

  // Filtrer les intégrations en fonction de la recherche et de la catégorie
  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      integration.features.some((feature) =>
        feature.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || integration.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SEOHead
        title="DeFi Integration Hub - TokenForge"
        description="Intégrez votre token avec les principaux protocoles DeFi pour maximiser son utilité et sa valeur."
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              DeFi Integration Hub
            </h1>
            <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
              Connectez votre token aux principaux protocoles DeFi pour
              maximiser son utilité et sa valeur.
            </p>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Rechercher une intégration
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white sm:text-sm"
                    placeholder="Nom, fonctionnalité ou mot-clé..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Catégorie
                </label>
                <select
                  id="category"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Liste des intégrations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredIntegrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
                        {integration.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {integration.name}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            integration.category === "dex"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : integration.category === "lending"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : integration.category === "yield"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                              : integration.category === "bridge"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                              : integration.category === "oracle"
                              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {categories.find(
                            (cat) => cat.id === integration.category
                          )?.name || integration.category}
                        </span>
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            integration.status === "Actif"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : integration.status === "Bêta"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {integration.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {integration.description}
                  </p>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Fonctionnalités principales
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {integration.features
                        .slice(0, 3)
                        .map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      {integration.features.length > 3 && (
                        <li>+ {integration.features.length - 3} autres</li>
                      )}
                    </ul>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Chaînes supportées
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {integration.chains.slice(0, 4).map((chain, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {chain}
                        </span>
                      ))}
                      {integration.chains.length > 4 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          +{integration.chains.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Complexité:{" "}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          integration.complexity === "Facile"
                            ? "text-green-600 dark:text-green-400"
                            : integration.complexity === "Moyenne"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {integration.complexity}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={integration.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                      >
                        Docs
                      </a>
                      <a
                        href={integration.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                      >
                        Site Web
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comment ça marche */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Comment intégrer votre token
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  1. Choisissez une intégration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sélectionnez le protocole DeFi qui correspond le mieux à vos
                  besoins et à votre stratégie de token.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  2. Configurez l'intégration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Utilisez notre interface pour configurer les paramètres
                  d'intégration et générer le code nécessaire.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  3. Déployez et testez
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Déployez l'intégration sur le réseau de test, vérifiez son bon
                  fonctionnement, puis passez au réseau principal.
                </p>
              </div>
            </div>
          </div>

          {/* Avantages */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Avantages des intégrations DeFi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Augmentez la liquidité
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  En intégrant votre token avec des DEX et des protocoles de
                  prêt, vous créez des opportunités pour les détenteurs
                  d'utiliser leurs tokens, augmentant ainsi la liquidité et
                  réduisant la volatilité.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Créez de la valeur
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Les intégrations DeFi permettent aux détenteurs de générer des
                  rendements supplémentaires, créant ainsi une proposition de
                  valeur plus forte pour votre token.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Élargissez votre écosystème
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Chaque intégration étend l'écosystème de votre token, attirant
                  de nouveaux utilisateurs et créant des synergies avec d'autres
                  projets blockchain.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Accélérez l'adoption
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Les intégrations avec des protocoles DeFi établis donnent de
                  la crédibilité à votre projet et facilitent l'adoption par les
                  utilisateurs existants de ces protocoles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DefiIntegrationHubPage;
