import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components";

interface Token {
  id: string;
  name: string;
  symbol: string;
  blockchain: string;
  address: string;
  createdAt: string;
  supply: string;
  price: number;
  change24h: number;
  holders: number;
  status: "active" | "pending" | "paused";
}

export const TokenListPage: React.FC = () => {
  // Données simulées des tokens
  const [tokens] = useState<Token[]>([
    {
      id: "1",
      name: "My First Token",
      symbol: "MFT",
      blockchain: "ethereum",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      createdAt: "2025-01-15T10:30:00Z",
      supply: "1,000,000",
      price: 0.05,
      change24h: 2.5,
      holders: 128,
      status: "active",
    },
    {
      id: "2",
      name: "Game Rewards",
      symbol: "GRWD",
      blockchain: "polygon",
      address: "0xabcdef1234567890abcdef1234567890abcdef12",
      createdAt: "2025-02-10T14:45:00Z",
      supply: "10,000,000",
      price: 0.008,
      change24h: -1.2,
      holders: 56,
      status: "active",
    },
    {
      id: "3",
      name: "DeFi Yield",
      symbol: "DYLD",
      blockchain: "bsc",
      address: "0x7890abcdef1234567890abcdef1234567890abcd",
      createdAt: "2025-02-28T09:15:00Z",
      supply: "5,000,000",
      price: 0.12,
      change24h: 8.7,
      holders: 312,
      status: "active",
    },
    {
      id: "4",
      name: "Community DAO",
      symbol: "CDAO",
      blockchain: "arbitrum",
      address: "0xdef1234567890abcdef1234567890abcdef123456",
      createdAt: "2025-03-01T16:20:00Z",
      supply: "2,500,000",
      price: 0,
      change24h: 0,
      holders: 0,
      status: "pending",
    },
  ]);

  // Formatage de l'adresse du contrat
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Icônes des blockchains
  const blockchainIcons: Record<string, string> = {
    ethereum: "🔷",
    bsc: "🟡",
    polygon: "🟣",
    avalanche: "🔺",
    solana: "🟪",
    arbitrum: "🔵",
  };

  return (
    <>
      <SEOHead
        title="Mes Tokens - TokenForge"
        description="Gérez vos tokens créés avec TokenForge. Consultez les statistiques et accédez aux outils de gestion."
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Mes Tokens
            </h1>
            <Link
              to="/create-token"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Créer un nouveau token
            </Link>
          </div>

          {tokens.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <div className="text-5xl mb-4">🪙</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Vous n'avez pas encore de tokens
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Créez votre premier token en quelques minutes avec notre
                assistant de création.
              </p>
              <Link
                to="/create-token"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Créer mon premier token
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Token
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Blockchain
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Adresse
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Date de création
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Prix
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Statut
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {tokens.map((token) => (
                      <tr
                        key={token.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                              {token.symbol.substring(0, 2)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {token.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {token.symbol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">
                              {blockchainIcons[token.blockchain] || "🔗"}
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white capitalize">
                              {token.blockchain}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white font-mono">
                            {formatAddress(token.address)}
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(token.address)
                              }
                              className="ml-2 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                            >
                              Copier
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatDate(token.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {token.status === "pending" ? (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              -
                            </span>
                          ) : (
                            <div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                ${token.price.toFixed(4)}
                              </div>
                              <div
                                className={`text-xs ${
                                  token.change24h > 0
                                    ? "text-green-600 dark:text-green-400"
                                    : token.change24h < 0
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {token.change24h > 0 ? "+" : ""}
                                {token.change24h}%
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              token.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : token.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {token.status === "active" && "Actif"}
                            {token.status === "pending" && "En attente"}
                            {token.status === "paused" && "Suspendu"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/tokens/${token.id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                          >
                            Détails
                          </Link>
                          <Link
                            to={`/tokens/${token.id}/liquidity`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Gérer
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
