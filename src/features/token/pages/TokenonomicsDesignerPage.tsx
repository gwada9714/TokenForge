import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SEOHead } from "@/components";

interface TokenDistribution {
  label: string;
  percentage: number;
  color: string;
  lockup?: {
    duration: number; // en mois
    initialRelease: number; // pourcentage
  };
}

export const TokenonomicsDesignerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Distribution initiale des tokens
  const [distribution, setDistribution] = useState<TokenDistribution[]>([
    {
      label: "Équipe",
      percentage: 15,
      color: "#4C51BF",
      lockup: { duration: 24, initialRelease: 0 },
    },
    {
      label: "Investisseurs",
      percentage: 20,
      color: "#2B6CB0",
      lockup: { duration: 12, initialRelease: 10 },
    },
    {
      label: "Réserve",
      percentage: 10,
      color: "#2C7A7B",
      lockup: { duration: 36, initialRelease: 0 },
    },
    {
      label: "Liquidité",
      percentage: 25,
      color: "#38A169",
      lockup: { duration: 6, initialRelease: 100 },
    },
    {
      label: "Marketing",
      percentage: 10,
      color: "#DD6B20",
      lockup: { duration: 12, initialRelease: 25 },
    },
    {
      label: "Communauté",
      percentage: 20,
      color: "#C53030",
      lockup: { duration: 0, initialRelease: 100 },
    },
  ]);

  // Paramètres du token
  const [tokenParams, setTokenParams] = useState({
    name: "Mon Token",
    symbol: "MTK",
    initialSupply: "1000000",
    maxSupply: "1000000",
    decimals: 18,
  });

  // Ajouter une nouvelle allocation
  const addAllocation = () => {
    const colors = [
      "#4C51BF",
      "#2B6CB0",
      "#2C7A7B",
      "#38A169",
      "#DD6B20",
      "#C53030",
      "#805AD5",
      "#D69E2E",
    ];
    const newColor = colors[Math.floor(Math.random() * colors.length)];

    setDistribution([
      ...distribution,
      {
        label: "Nouvelle allocation",
        percentage: 5,
        color: newColor,
        lockup: { duration: 0, initialRelease: 100 },
      },
    ]);
  };

  // Supprimer une allocation
  const removeAllocation = (index: number) => {
    const newDistribution = [...distribution];
    newDistribution.splice(index, 1);
    setDistribution(newDistribution);
  };

  // Mettre à jour une allocation
  const updateAllocation = (index: number, field: string, value: any) => {
    const newDistribution = [...distribution];

    if (field === "percentage") {
      newDistribution[index].percentage = Math.min(
        100,
        Math.max(0, Number(value))
      );
    } else if (field === "label") {
      newDistribution[index].label = value;
    } else if (field.startsWith("lockup.")) {
      const lockupField = field.split(".")[1];
      if (!newDistribution[index].lockup) {
        newDistribution[index].lockup = { duration: 0, initialRelease: 100 };
      }

      if (lockupField === "duration") {
        newDistribution[index].lockup!.duration = Math.max(0, Number(value));
      } else if (lockupField === "initialRelease") {
        newDistribution[index].lockup!.initialRelease = Math.min(
          100,
          Math.max(0, Number(value))
        );
      }
    }

    setDistribution(newDistribution);
  };

  // Calculer le total des pourcentages
  const totalPercentage = distribution.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  // Normaliser les pourcentages pour qu'ils totalisent 100%
  const normalizeDistribution = () => {
    if (totalPercentage === 0) return;

    const factor = 100 / totalPercentage;
    const newDistribution = distribution.map((item) => ({
      ...item,
      percentage: Math.round(item.percentage * factor),
    }));

    setDistribution(newDistribution);
  };

  // Générer les données pour le graphique en anneau
  const generateChartData = () => {
    return {
      labels: distribution.map((item) => item.label),
      datasets: [
        {
          data: distribution.map((item) => item.percentage),
          backgroundColor: distribution.map((item) => item.color),
          borderWidth: 0,
        },
      ],
    };
  };

  // Générer les données pour le graphique de libération
  const generateVestingData = () => {
    const months = 36; // 3 ans
    const labels = Array.from({ length: months + 1 }, (_, i) => `M${i}`);
    const datasets = distribution.map((item) => {
      const data = Array(months + 1).fill(0);

      if (item.lockup) {
        const { duration, initialRelease } = item.lockup;

        // Libération initiale
        data[0] = (item.percentage * initialRelease) / 100;

        // Libération progressive
        const remainingPercentage = item.percentage - data[0];

        if (duration > 0) {
          const monthlyRelease = remainingPercentage / duration;

          for (let i = 1; i <= duration; i++) {
            data[i] = monthlyRelease;
          }
        }
      } else {
        // Sans lockup, tout est libéré immédiatement
        data[0] = item.percentage;
      }

      return {
        label: item.label,
        data,
        backgroundColor: item.color,
        borderColor: item.color,
      };
    });

    return { labels, datasets };
  };

  return (
    <>
      <SEOHead
        title="Tokenomics Designer - TokenForge"
        description="Concevez et visualisez la distribution et le vesting de vos tokens avec notre outil de design tokenomics."
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Tokenomics Designer
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Concevez et visualisez la distribution et le vesting de vos
                tokens
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche - Paramètres du token */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Paramètres du token
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Nom du token
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={tokenParams.name}
                      onChange={(e) =>
                        setTokenParams({ ...tokenParams, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="symbol"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Symbole
                    </label>
                    <input
                      type="text"
                      id="symbol"
                      value={tokenParams.symbol}
                      onChange={(e) =>
                        setTokenParams({
                          ...tokenParams,
                          symbol: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="initialSupply"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Supply initiale
                    </label>
                    <input
                      type="text"
                      id="initialSupply"
                      value={tokenParams.initialSupply}
                      onChange={(e) =>
                        setTokenParams({
                          ...tokenParams,
                          initialSupply: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="maxSupply"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Supply maximale
                    </label>
                    <input
                      type="text"
                      id="maxSupply"
                      value={tokenParams.maxSupply}
                      onChange={(e) =>
                        setTokenParams({
                          ...tokenParams,
                          maxSupply: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="decimals"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Décimales
                    </label>
                    <input
                      type="number"
                      id="decimals"
                      value={tokenParams.decimals}
                      onChange={(e) =>
                        setTokenParams({
                          ...tokenParams,
                          decimals: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Graphique de distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Distribution des tokens
                </h2>
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-gray-500 dark:text-gray-400">
                    Graphique en anneau
                  </div>
                </div>
                <div
                  className={`text-center font-medium ${
                    totalPercentage === 100
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  Total: {totalPercentage}%
                </div>
                {totalPercentage !== 100 && (
                  <button
                    onClick={normalizeDistribution}
                    className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Normaliser à 100%
                  </button>
                )}
              </div>
            </div>

            {/* Colonne centrale et droite - Allocations et graphique de vesting */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Allocations
                  </h2>
                  <button
                    onClick={addAllocation}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    + Ajouter
                  </button>
                </div>

                <div className="space-y-6">
                  {distribution.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) =>
                              updateAllocation(index, "label", e.target.value)
                            }
                            className="font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-0"
                          />
                        </div>
                        <button
                          onClick={() => removeAllocation(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Pourcentage
                          </label>
                          <div className="flex items-center">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={item.percentage}
                              onChange={(e) =>
                                updateAllocation(
                                  index,
                                  "percentage",
                                  e.target.value
                                )
                              }
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white w-12">
                              {item.percentage}%
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Période de vesting (mois)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.lockup?.duration || 0}
                            onChange={(e) =>
                              updateAllocation(
                                index,
                                "lockup.duration",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Libération initiale (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.lockup?.initialRelease || 0}
                            onChange={(e) =>
                              updateAllocation(
                                index,
                                "lockup.initialRelease",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphique de vesting */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Calendrier de libération (Vesting)
                </h2>
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    Graphique de vesting
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-between">
            <Link
              to={`/tokens/${id || ""}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </Link>
            <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Appliquer la tokenomics
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
