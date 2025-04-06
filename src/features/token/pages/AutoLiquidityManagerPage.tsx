import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { SEOHead } from "@/components";

interface LiquidityPool {
  id: string;
  dex: string;
  pair: string;
  liquidity: number;
  tokenAmount: string;
  otherTokenAmount: string;
  otherToken: string;
  apr: number;
  lockPeriod?: number; // en jours
  lockEndDate?: string;
}

interface LiquiditySettings {
  autoLiquidityFee: number;
  autoLiquidityThreshold: string;
  preferredDex: string;
  preferredPair: string;
}

const AutoLiquidityManagerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Données simulées du token
  const [tokenData] = useState({
    id: id || "1",
    name: "My First Token",
    symbol: "MFT",
    blockchain: "ethereum",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    balance: "250,000",
  });

  // Données simulées des pools de liquidité
  const [liquidityPools] = useState<LiquidityPool[]>([
    {
      id: "1",
      dex: "Uniswap V3",
      pair: "MFT/ETH",
      liquidity: 75000,
      tokenAmount: "150,000",
      otherTokenAmount: "25",
      otherToken: "ETH",
      apr: 12.5,
      lockPeriod: 90,
      lockEndDate: "2025-06-01T00:00:00Z",
    },
    {
      id: "2",
      dex: "Uniswap V3",
      pair: "MFT/USDT",
      liquidity: 50000,
      tokenAmount: "100,000",
      otherTokenAmount: "5,000",
      otherToken: "USDT",
      apr: 8.2,
    },
  ]);

  // Paramètres de liquidité automatique
  const [liquiditySettings, setLiquiditySettings] = useState<LiquiditySettings>(
    {
      autoLiquidityFee: 2,
      autoLiquidityThreshold: "1000",
      preferredDex: "Uniswap V3",
      preferredPair: "MFT/ETH",
    }
  );

  // État pour le formulaire d'ajout de liquidité
  const [addLiquidityForm, setAddLiquidityForm] = useState({
    dex: "Uniswap V3",
    pair: "MFT/ETH",
    tokenAmount: "",
    lockPeriod: 0, // 0 = pas de verrouillage
  });

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Mise à jour des paramètres de liquidité automatique
  const handleSettingsChange =
    (field: keyof LiquiditySettings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setLiquiditySettings({
        ...liquiditySettings,
        [field]:
          field === "autoLiquidityFee"
            ? parseFloat(e.target.value)
            : e.target.value,
      });
    };

  // Mise à jour du formulaire d'ajout de liquidité
  const handleAddLiquidityChange =
    (field: keyof typeof addLiquidityForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setAddLiquidityForm({
        ...addLiquidityForm,
        [field]:
          field === "tokenAmount" || field === "lockPeriod"
            ? e.target.value
            : e.target.value,
      });
    };

  // Soumission du formulaire d'ajout de liquidité
  const handleAddLiquidity = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Ajout de liquidité simulé: ${addLiquidityForm.tokenAmount} ${tokenData.symbol} sur ${addLiquidityForm.dex} (${addLiquidityForm.pair})`
    );
    // Réinitialisation du formulaire
    setAddLiquidityForm({
      ...addLiquidityForm,
      tokenAmount: "",
    });
  };

  // Sauvegarde des paramètres de liquidité automatique
  const saveSettings = () => {
    alert("Paramètres de liquidité automatique sauvegardés");
  };

  return (
    <>
      <SEOHead
        title={`Gestion de Liquidité - ${tokenData.name} (${tokenData.symbol})`}
        description="Gérez la liquidité de votre token, configurez l'auto-liquidité et suivez vos pools de liquidité."
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link
                to={`/tokens/${tokenData.id}`}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
              >
                &larr; Retour au token
              </Link>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Gestion de Liquidité
                </h1>
                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                  {tokenData.name} ({tokenData.symbol})
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Balance disponible:
                </span>
                <span className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
                  {tokenData.balance} {tokenData.symbol}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche - Pools de liquidité */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Pools de Liquidité
                </h2>
                {liquidityPools.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      Aucun pool de liquidité n'a été créé pour ce token.
                    </p>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Ajoutez de la liquidité pour permettre les échanges de
                      votre token.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            DEX / Paire
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Liquidité
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Tokens
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            APR
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Verrouillage
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {liquidityPools.map((pool) => (
                          <tr key={pool.id}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {pool.dex}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {pool.pair}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                ${pool.liquidity.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {pool.tokenAmount} {tokenData.symbol}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {pool.otherTokenAmount} {pool.otherToken}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                {pool.apr}%
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {pool.lockPeriod ? (
                                <div>
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    {pool.lockPeriod} jours
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Jusqu'au{" "}
                                    {formatDate(pool.lockEndDate || "")}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Non verrouillé
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                onClick={() =>
                                  alert(
                                    `Ajouter de la liquidité à ${pool.pair}`
                                  )
                                }
                              >
                                Ajouter
                              </button>
                              <button
                                className={`${
                                  pool.lockPeriod
                                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                    : "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                }`}
                                disabled={!!pool.lockPeriod}
                                onClick={() =>
                                  !pool.lockPeriod &&
                                  alert(
                                    `Retirer de la liquidité de ${pool.pair}`
                                  )
                                }
                              >
                                Retirer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Formulaire d'ajout de liquidité */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Ajouter de la Liquidité
                </h2>
                <form onSubmit={handleAddLiquidity}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="dex"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Exchange Décentralisé (DEX)
                      </label>
                      <select
                        id="dex"
                        value={addLiquidityForm.dex}
                        onChange={handleAddLiquidityChange("dex")}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="Uniswap V3">Uniswap V3</option>
                        <option value="SushiSwap">SushiSwap</option>
                        <option value="PancakeSwap">PancakeSwap</option>
                        <option value="QuickSwap">QuickSwap</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="pair"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Paire
                      </label>
                      <select
                        id="pair"
                        value={addLiquidityForm.pair}
                        onChange={handleAddLiquidityChange("pair")}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="MFT/ETH">MFT/ETH</option>
                        <option value="MFT/USDT">MFT/USDT</option>
                        <option value="MFT/USDC">MFT/USDC</option>
                        <option value="MFT/DAI">MFT/DAI</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="tokenAmount"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Montant de {tokenData.symbol}
                      </label>
                      <input
                        type="text"
                        id="tokenAmount"
                        value={addLiquidityForm.tokenAmount}
                        onChange={handleAddLiquidityChange("tokenAmount")}
                        placeholder={`Ex: 10000 ${tokenData.symbol}`}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lockPeriod"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Période de verrouillage (jours)
                      </label>
                      <input
                        type="number"
                        id="lockPeriod"
                        value={addLiquidityForm.lockPeriod}
                        onChange={handleAddLiquidityChange("lockPeriod")}
                        min="0"
                        max="365"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        0 = pas de verrouillage. Le verrouillage de liquidité
                        rassure les investisseurs.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Ajouter de la liquidité
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Colonne de droite - Paramètres */}
            <div className="space-y-8">
              {/* Paramètres d'auto-liquidité */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Paramètres d'Auto-Liquidité
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="autoLiquidityFee"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Frais d'auto-liquidité (%)
                    </label>
                    <input
                      type="number"
                      id="autoLiquidityFee"
                      value={liquiditySettings.autoLiquidityFee}
                      onChange={handleSettingsChange("autoLiquidityFee")}
                      min="0"
                      max="10"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Pourcentage de chaque transaction qui sera automatiquement
                      ajouté à la liquidité.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="autoLiquidityThreshold"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Seuil d'auto-liquidité ({tokenData.symbol})
                    </label>
                    <input
                      type="text"
                      id="autoLiquidityThreshold"
                      value={liquiditySettings.autoLiquidityThreshold}
                      onChange={handleSettingsChange("autoLiquidityThreshold")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Montant minimum de tokens à accumuler avant d'ajouter à la
                      liquidité.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="preferredDex"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      DEX préféré
                    </label>
                    <select
                      id="preferredDex"
                      value={liquiditySettings.preferredDex}
                      onChange={handleSettingsChange("preferredDex")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="Uniswap V3">Uniswap V3</option>
                      <option value="SushiSwap">SushiSwap</option>
                      <option value="PancakeSwap">PancakeSwap</option>
                      <option value="QuickSwap">QuickSwap</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="preferredPair"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Paire préférée
                    </label>
                    <select
                      id="preferredPair"
                      value={liquiditySettings.preferredPair}
                      onChange={handleSettingsChange("preferredPair")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="MFT/ETH">MFT/ETH</option>
                      <option value="MFT/USDT">MFT/USDT</option>
                      <option value="MFT/USDC">MFT/USDC</option>
                      <option value="MFT/DAI">MFT/DAI</option>
                    </select>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={saveSettings}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Sauvegarder les paramètres
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistiques de liquidité */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Statistiques de Liquidité
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Liquidité totale
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      $
                      {liquidityPools
                        .reduce((sum, pool) => sum + pool.liquidity, 0)
                        .toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Tokens en liquidité
                    </div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {liquidityPools
                        .reduce(
                          (sum, pool) =>
                            sum + parseInt(pool.tokenAmount.replace(/,/g, "")),
                          0
                        )
                        .toLocaleString()}{" "}
                      {tokenData.symbol}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      (
                      {(
                        (liquidityPools.reduce(
                          (sum, pool) =>
                            sum + parseInt(pool.tokenAmount.replace(/,/g, "")),
                          0
                        ) /
                          parseInt(tokenData.balance.replace(/,/g, ""))) *
                        100
                      ).toFixed(2)}
                      % du supply)
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      APR moyen
                    </div>
                    <div className="text-lg font-medium text-green-600 dark:text-green-400">
                      {(
                        liquidityPools.reduce(
                          (sum, pool) => sum + pool.apr,
                          0
                        ) / liquidityPools.length
                      ).toFixed(2)}
                      %
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Liquidité verrouillée
                    </div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      $
                      {liquidityPools
                        .filter((pool) => pool.lockPeriod)
                        .reduce((sum, pool) => sum + pool.liquidity, 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      (
                      {(
                        (liquidityPools
                          .filter((pool) => pool.lockPeriod)
                          .reduce((sum, pool) => sum + pool.liquidity, 0) /
                          liquidityPools.reduce(
                            (sum, pool) => sum + pool.liquidity,
                            0
                          )) *
                        100
                      ).toFixed(2)}
                      % de la liquidité totale)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AutoLiquidityManagerPage;
