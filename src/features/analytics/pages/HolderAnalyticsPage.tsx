import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { SEOHead } from "@/components";

export const HolderAnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [timeframe, setTimeframe] = useState("7d");
  const [tokenData] = useState({
    id: id || "1",
    name: "My First Token",
    symbol: "MFT",
    totalHolders: 1245,
    avgHoldingTime: "34 jours",
  });

  // Données simulées pour les graphiques
  const [holderStats] = useState({
    distribution: [
      { category: "0-100", count: 450, percentage: 36.1 },
      { category: "100-1K", count: 320, percentage: 25.7 },
      { category: "1K-10K", count: 280, percentage: 22.5 },
      { category: "10K-100K", count: 150, percentage: 12.0 },
      { category: "100K+", count: 45, percentage: 3.7 },
    ],
    topHolders: [
      { address: "0x1a2...3b4c", amount: "1,250,000", percentage: 12.5 },
      { address: "0x5d6...7e8f", amount: "850,000", percentage: 8.5 },
      { address: "0x9a0...1b2c", amount: "720,000", percentage: 7.2 },
      { address: "0x3d4...5e6f", amount: "580,000", percentage: 5.8 },
      { address: "0x7g8...9h0i", amount: "450,000", percentage: 4.5 },
    ],
    recentMovements: [
      { date: "2025-02-28", inflow: 125000, outflow: 75000 },
      { date: "2025-03-01", inflow: 95000, outflow: 110000 },
      { date: "2025-03-02", inflow: 150000, outflow: 85000 },
    ],
    retentionRate: 78.5,
  });

  return (
    <>
      <SEOHead
        title={`Analyse des Détenteurs - ${tokenData.name} (${tokenData.symbol})`}
        description="Analyse détaillée des détenteurs de tokens, distribution et comportements."
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analyse des Détenteurs
            </h1>
            <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
              {tokenData.name} ({tokenData.symbol})
            </p>
          </div>

          {/* Filtres et contrôles */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex space-x-4 mb-2 sm:mb-0">
                <button
                  onClick={() => setTimeframe("24h")}
                  className={`px-3 py-1 rounded-md ${
                    timeframe === "24h"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  24h
                </button>
                <button
                  onClick={() => setTimeframe("7d")}
                  className={`px-3 py-1 rounded-md ${
                    timeframe === "7d"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  7j
                </button>
                <button
                  onClick={() => setTimeframe("30d")}
                  className={`px-3 py-1 rounded-md ${
                    timeframe === "30d"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  30j
                </button>
                <button
                  onClick={() => setTimeframe("all")}
                  className={`px-3 py-1 rounded-md ${
                    timeframe === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Tout
                </button>
              </div>
              <div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Exporter les données
                </button>
              </div>
            </div>
          </div>

          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nombre de détenteurs
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {tokenData.totalHolders.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                +12.5% depuis 30 jours
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Temps moyen de détention
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {tokenData.avgHoldingTime}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                +5.2% depuis 30 jours
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Taux de rétention
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {holderStats.retentionRate}%
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                +2.1% depuis 30 jours
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Concentration (top 10)
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                38.5%
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                +3.2% depuis 30 jours
              </p>
            </div>
          </div>

          {/* Distribution des détenteurs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Distribution des détenteurs
              </h3>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  [Graphique de distribution]
                </div>
              </div>
              <div className="mt-4">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Pourcentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {holderStats.distribution.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.category}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.count}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Mouvements récents
              </h3>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  [Graphique des mouvements]
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div>Entrées: +370,000 tokens</div>
                  <div>Sorties: -270,000 tokens</div>
                  <div>Net: +100,000 tokens</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top détenteurs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Top Détenteurs
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rang
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Adresse
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      % du Supply
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Première transaction
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Dernière transaction
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {holderStats.topHolders.map((holder, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                        {holder.address}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {holder.amount}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {holder.percentage}%
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {index === 0
                          ? "2025-01-15"
                          : index === 1
                          ? "2025-01-18"
                          : index === 2
                          ? "2025-01-20"
                          : index === 3
                          ? "2025-01-25"
                          : "2025-02-01"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {index === 0
                          ? "2025-02-28"
                          : index === 1
                          ? "2025-03-01"
                          : index === 2
                          ? "2025-02-25"
                          : index === 3
                          ? "2025-03-01"
                          : "2025-02-20"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alertes et recommandations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Alertes et Recommandations
            </h3>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600">
                <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-300">
                  Concentration élevée
                </h4>
                <p className="mt-1 text-yellow-700 dark:text-yellow-200">
                  Les 5 principaux détenteurs possèdent 38.5% du supply total.
                  Cela peut représenter un risque de volatilité en cas de vente
                  importante.
                </p>
              </div>
              <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600">
                <h4 className="text-lg font-medium text-green-800 dark:text-green-300">
                  Croissance stable
                </h4>
                <p className="mt-1 text-green-700 dark:text-green-200">
                  Le nombre de détenteurs augmente de manière constante (+12.5%
                  sur 30 jours), indiquant un intérêt croissant pour le token.
                </p>
              </div>
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600">
                <h4 className="text-lg font-medium text-blue-800 dark:text-blue-300">
                  Recommandation
                </h4>
                <p className="mt-1 text-blue-700 dark:text-blue-200">
                  Envisagez des initiatives communautaires pour encourager une
                  distribution plus large des tokens et réduire la
                  concentration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HolderAnalyticsPage;
