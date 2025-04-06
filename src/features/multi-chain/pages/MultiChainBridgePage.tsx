import React, { useState } from "react";
import { SEOHead } from "@/components";

export const MultiChainBridgePage: React.FC = () => {
  const [sourceChain, setSourceChain] = useState("ethereum");
  const [targetChain, setTargetChain] = useState("binance");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  // Liste des chaînes supportées
  const supportedChains = [
    { id: "ethereum", name: "Ethereum", icon: "🔷", fee: "0.1%" },
    { id: "binance", name: "Binance Smart Chain", icon: "🟡", fee: "0.05%" },
    { id: "polygon", name: "Polygon", icon: "🟣", fee: "0.03%" },
    { id: "avalanche", name: "Avalanche", icon: "🔺", fee: "0.08%" },
    { id: "arbitrum", name: "Arbitrum", icon: "🔵", fee: "0.07%" },
    { id: "optimism", name: "Optimism", icon: "🔴", fee: "0.06%" },
  ];

  // Liste des tokens supportés par chaîne
  const chainTokens = {
    ethereum: [
      { symbol: "ETH", name: "Ethereum", balance: "2.45" },
      { symbol: "USDT", name: "Tether USD", balance: "1,250.00" },
      { symbol: "USDC", name: "USD Coin", balance: "750.50" },
      { symbol: "DAI", name: "Dai Stablecoin", balance: "500.00" },
      { symbol: "WBTC", name: "Wrapped Bitcoin", balance: "0.15" },
    ],
    binance: [
      { symbol: "BNB", name: "Binance Coin", balance: "10.75" },
      { symbol: "BUSD", name: "Binance USD", balance: "2,000.00" },
      { symbol: "CAKE", name: "PancakeSwap", balance: "150.25" },
      { symbol: "USDT", name: "Tether USD", balance: "1,500.00" },
      { symbol: "BTCB", name: "Binance BTC", balance: "0.08" },
    ],
    polygon: [
      { symbol: "MATIC", name: "Polygon", balance: "1,200.00" },
      { symbol: "USDT", name: "Tether USD", balance: "800.00" },
      { symbol: "USDC", name: "USD Coin", balance: "650.00" },
      { symbol: "AAVE", name: "Aave", balance: "5.25" },
      { symbol: "WETH", name: "Wrapped Ethereum", balance: "1.20" },
    ],
    avalanche: [
      { symbol: "AVAX", name: "Avalanche", balance: "45.50" },
      { symbol: "USDT", name: "Tether USD", balance: "950.00" },
      { symbol: "USDC", name: "USD Coin", balance: "850.00" },
      { symbol: "JOE", name: "Trader Joe", balance: "200.00" },
      { symbol: "WAVAX", name: "Wrapped AVAX", balance: "30.00" },
    ],
    arbitrum: [
      { symbol: "ETH", name: "Ethereum", balance: "1.75" },
      { symbol: "USDT", name: "Tether USD", balance: "1,100.00" },
      { symbol: "USDC", name: "USD Coin", balance: "900.00" },
      { symbol: "ARB", name: "Arbitrum", balance: "500.00" },
      { symbol: "GMX", name: "GMX", balance: "10.00" },
    ],
    optimism: [
      { symbol: "ETH", name: "Ethereum", balance: "1.50" },
      { symbol: "USDT", name: "Tether USD", balance: "1,050.00" },
      { symbol: "USDC", name: "USD Coin", balance: "850.00" },
      { symbol: "OP", name: "Optimism", balance: "300.00" },
      { symbol: "SNX", name: "Synthetix", balance: "75.00" },
    ],
  };

  // Historique des transactions
  const [transactionHistory] = useState([
    {
      id: "tx1",
      sourceChain: "ethereum",
      targetChain: "binance",
      token: "USDT",
      amount: "500.00",
      status: "completed",
      timestamp: "2025-02-28T14:30:00Z",
      fee: "0.50",
    },
    {
      id: "tx2",
      sourceChain: "binance",
      targetChain: "polygon",
      token: "BUSD",
      amount: "1,000.00",
      status: "completed",
      timestamp: "2025-02-25T10:15:00Z",
      fee: "0.50",
    },
    {
      id: "tx3",
      sourceChain: "polygon",
      targetChain: "avalanche",
      token: "USDC",
      amount: "250.00",
      status: "pending",
      timestamp: "2025-03-01T09:45:00Z",
      fee: "0.08",
    },
  ]);

  // Fonction pour gérer le transfert
  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !token || sourceChain === targetChain) return;

    setIsLoading(true);

    // Simuler une transaction
    setTimeout(() => {
      setTxHash("0x" + Math.random().toString(16).substr(2, 64));
      setIsLoading(false);
    }, 2000);
  };

  // Fonction pour obtenir le nom de la chaîne
  const getChainName = (chainId: string) => {
    const chain = supportedChains.find((c) => c.id === chainId);
    return chain ? chain.name : chainId;
  };

  // Fonction pour obtenir l'icône de la chaîne
  const getChainIcon = (chainId: string) => {
    const chain = supportedChains.find((c) => c.id === chainId);
    return chain ? chain.icon : "🔗";
  };

  return (
    <>
      <SEOHead
        title="Multi-Chain Bridge - TokenForge"
        description="Transférez vos tokens entre différentes blockchains de manière sécurisée et rapide."
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Multi-Chain Bridge
            </h1>
            <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
              Transférez vos tokens entre différentes blockchains de manière
              sécurisée et rapide.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire de transfert */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Transfert Cross-Chain
                </h2>

                {txHash ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-green-800 dark:text-green-300">
                      Transaction initiée !
                    </h3>
                    <p className="mt-2 text-sm text-green-700 dark:text-green-200">
                      Votre transfert a été initié avec succès. Vous pouvez
                      suivre la progression dans l'historique des transactions.
                    </p>
                    <div className="mt-2">
                      <span className="text-sm font-medium text-green-700 dark:text-green-200">
                        Hash de transaction:
                      </span>
                      <code className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-800/30 rounded text-xs text-green-800 dark:text-green-200 font-mono">
                        {txHash}
                      </code>
                    </div>
                    <button
                      onClick={() => setTxHash("")}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Nouveau transfert
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleTransfer}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Chaîne source */}
                      <div>
                        <label
                          htmlFor="sourceChain"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Chaîne source
                        </label>
                        <select
                          id="sourceChain"
                          value={sourceChain}
                          onChange={(e) => setSourceChain(e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                          {supportedChains.map((chain) => (
                            <option key={chain.id} value={chain.id}>
                              {chain.icon} {chain.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Chaîne cible */}
                      <div>
                        <label
                          htmlFor="targetChain"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Chaîne cible
                        </label>
                        <select
                          id="targetChain"
                          value={targetChain}
                          onChange={(e) => setTargetChain(e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                          {supportedChains.map((chain) => (
                            <option
                              key={chain.id}
                              value={chain.id}
                              disabled={chain.id === sourceChain}
                            >
                              {chain.icon} {chain.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Visualisation du transfert */}
                    <div className="flex items-center justify-center my-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-2xl">
                          {getChainIcon(sourceChain)}
                        </div>
                        <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getChainName(sourceChain)}
                        </span>
                      </div>
                      <div className="mx-4 w-24 h-0.5 bg-blue-500"></div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full text-2xl">
                          {getChainIcon(targetChain)}
                        </div>
                        <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getChainName(targetChain)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Token */}
                      <div>
                        <label
                          htmlFor="token"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Token
                        </label>
                        <select
                          id="token"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Sélectionnez un token</option>
                          {sourceChain &&
                            chainTokens[
                              sourceChain as keyof typeof chainTokens
                            ].map((t) => (
                              <option key={t.symbol} value={t.symbol}>
                                {t.symbol} - {t.name} (Balance: {t.balance})
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Montant */}
                      <div>
                        <label
                          htmlFor="amount"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Montant
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          />
                          {token && (
                            <button
                              type="button"
                              onClick={() => {
                                const selectedToken = chainTokens[
                                  sourceChain as keyof typeof chainTokens
                                ].find((t) => t.symbol === token);
                                if (selectedToken) {
                                  setAmount(selectedToken.balance);
                                }
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              MAX
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Informations sur les frais */}
                    {sourceChain &&
                      targetChain &&
                      sourceChain !== targetChain && (
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-6">
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Informations sur le transfert
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Frais de bridge:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {supportedChains.find(
                                  (c) => c.id === sourceChain
                                )?.fee || "0.1%"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Temps estimé:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                ~15 minutes
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Montant minimum:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                Équivalent à $10
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Montant maximum:
                              </span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                Équivalent à $100,000
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Bouton de soumission */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={
                          isLoading ||
                          !amount ||
                          !token ||
                          sourceChain === targetChain
                        }
                        className={`px-6 py-3 rounded-md text-white font-medium ${
                          isLoading ||
                          !amount ||
                          !token ||
                          sourceChain === targetChain
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        } transition-colors`}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Traitement en cours...
                          </span>
                        ) : (
                          "Initier le transfert"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Informations et statistiques */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Statistiques du Bridge
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Volume total
                    </h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                      $45,782,156
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Transactions
                    </h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                      124,567
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Utilisateurs
                    </h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                      32,891
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Temps moyen de transfert
                    </h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                      12 minutes
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Chaînes supportées
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {supportedChains.map((chain) => (
                    <div
                      key={chain.id}
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-2xl mr-2">{chain.icon}</span>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {chain.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Frais: {chain.fee}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Historique des transactions */}
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Historique des transactions
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        De
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Vers
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Token
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Frais
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transactionHistory.map((tx) => (
                      <tr key={tx.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <span className="mr-1">
                              {getChainIcon(tx.sourceChain)}
                            </span>
                            {getChainName(tx.sourceChain)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <span className="mr-1">
                              {getChainIcon(tx.targetChain)}
                            </span>
                            {getChainName(tx.targetChain)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {tx.token}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {tx.amount}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {tx.fee} {tx.token}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tx.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : tx.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            }`}
                          >
                            {tx.status === "completed"
                              ? "Complété"
                              : tx.status === "pending"
                              ? "En cours"
                              : "Échoué"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MultiChainBridgePage;
