import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '@/components';

interface TokenData {
  id: string;
  name: string;
  symbol: string;
  blockchain: string;
  address: string;
  createdAt: string;
  supply: {
    total: string;
    circulating: string;
    burned: string;
  };
  price: {
    current: number;
    change24h: number;
    ath: number;
    atl: number;
  };
  liquidity: {
    total: number;
    pairs: Array<{
      dex: string;
      pair: string;
      liquidity: number;
      volume24h: number;
    }>;
  };
  holders: {
    count: number;
    top: Array<{
      address: string;
      balance: string;
      percentage: number;
    }>;
  };
  transactions: {
    total: number;
    recent: Array<{
      hash: string;
      type: 'buy' | 'sell' | 'transfer';
      amount: string;
      from: string;
      to: string;
      timestamp: string;
    }>;
  };
}

export const TokenDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Données simulées du token
  const token: TokenData = {
    id: id || '1',
    name: 'My First Token',
    symbol: 'MFT',
    blockchain: 'ethereum',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: '2025-01-15T10:30:00Z',
    supply: {
      total: '1,000,000',
      circulating: '850,000',
      burned: '50,000',
    },
    price: {
      current: 0.05,
      change24h: 2.5,
      ath: 0.08,
      atl: 0.01,
    },
    liquidity: {
      total: 125000,
      pairs: [
        {
          dex: 'Uniswap V3',
          pair: 'MFT/ETH',
          liquidity: 75000,
          volume24h: 12500,
        },
        {
          dex: 'Uniswap V3',
          pair: 'MFT/USDT',
          liquidity: 50000,
          volume24h: 8000,
        },
      ],
    },
    holders: {
      count: 128,
      top: [
        {
          address: '0xabcd...1234',
          balance: '150,000',
          percentage: 15,
        },
        {
          address: '0xefgh...5678',
          balance: '100,000',
          percentage: 10,
        },
        {
          address: '0xijkl...9012',
          balance: '75,000',
          percentage: 7.5,
        },
      ],
    },
    transactions: {
      total: 1256,
      recent: [
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          type: 'buy',
          amount: '5,000',
          from: '0x1111...2222',
          to: '0x3333...4444',
          timestamp: '2025-03-01T15:30:00Z',
        },
        {
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          type: 'sell',
          amount: '2,500',
          from: '0x5555...6666',
          to: '0x7777...8888',
          timestamp: '2025-03-01T14:45:00Z',
        },
        {
          hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
          type: 'transfer',
          amount: '10,000',
          from: '0x9999...0000',
          to: '0xaaaa...bbbb',
          timestamp: '2025-03-01T13:20:00Z',
        },
      ],
    },
  };

  // Formatage de l'adresse du contrat
  const formatAddress = (address: string) => {
    if (address.includes('...')) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Icônes des blockchains
  const blockchainIcons: Record<string, string> = {
    ethereum: '🔷',
    bsc: '🟡',
    polygon: '🟣',
    avalanche: '🔺',
    solana: '🟪',
    arbitrum: '🔵',
  };

  return (
    <>
      <SEOHead
        title={`${token.name} (${token.symbol}) - TokenForge`}
        description={`Détails et statistiques pour ${token.name}, un token créé avec TokenForge sur ${token.blockchain}.`}
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête du token */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl font-bold mr-4">
                  {token.symbol.substring(0, 2)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {token.name} <span className="text-gray-500 dark:text-gray-400">({token.symbol})</span>
                  </h1>
                  <div className="flex items-center mt-1">
                    <span className="mr-2">{blockchainIcons[token.blockchain] || '🔗'}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {token.blockchain}
                    </span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {formatAddress(token.address)}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(token.address)}
                      className="ml-2 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${token.price.current.toFixed(4)}
                </div>
                <div className={`text-sm ${token.price.change24h > 0
                    ? 'text-green-600 dark:text-green-400'
                    : token.price.change24h < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                  {token.price.change24h > 0 ? '+' : ''}{token.price.change24h}% (24h)
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to={`/tokens/${token.id}/liquidity`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Gérer la liquidité
              </Link>
              <Link
                to={`/tokens/${token.id}/staking`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Configurer le staking
              </Link>
              <a
                href={`https://${token.blockchain === 'ethereum' ? 'etherscan.io' : token.blockchain + 'scan.com'}/token/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Explorer
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne de gauche */}
            <div className="lg:col-span-2 space-y-8">
              {/* Statistiques principales */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Statistiques
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Supply totale</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{token.supply.total}</div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Supply circulante</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{token.supply.circulating}</div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tokens brûlés</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{token.supply.burned}</div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Détenteurs</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{token.holders.count}</div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Prix le plus haut</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">${token.price.ath.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Prix le plus bas</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">${token.price.atl.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Liquidité totale</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">${token.liquidity.total.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date de création</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{formatDate(token.createdAt)}</div>
                  </div>
                </div>
              </div>

              {/* Paires de liquidité */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Paires de liquidité
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DEX</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paire</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Liquidité</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Volume (24h)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {token.liquidity.pairs.map((pair, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{pair.dex}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{pair.pair}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">${pair.liquidity.toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">${pair.volume24h.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions récentes */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Transactions récentes
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">De</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">À</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {token.transactions.recent.map((tx, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'buy'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : tx.type === 'sell'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}>
                              {tx.type === 'buy' && 'Achat'}
                              {tx.type === 'sell' && 'Vente'}
                              {tx.type === 'transfer' && 'Transfert'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{tx.amount} {token.symbol}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">{tx.from}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">{tx.to}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatDate(tx.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-center">
                  <a
                    href={`https://${token.blockchain === 'ethereum' ? 'etherscan.io' : token.blockchain + 'scan.com'}/token/${token.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Voir toutes les transactions
                  </a>
                </div>
              </div>
            </div>

            {/* Colonne de droite */}
            <div className="space-y-8">
              {/* Principaux détenteurs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Principaux détenteurs
                </h2>
                <div className="space-y-4">
                  {token.holders.top.map((holder, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xs font-bold mr-3">
                          {index + 1}
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                          {holder.address}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {holder.balance} {token.symbol}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {holder.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Autres détenteurs</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {(100 - token.holders.top.reduce((acc, holder) => acc + holder.percentage, 0)).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Actions rapides
                </h2>
                <div className="space-y-3">
                  <Link
                    to={`/tokens/${token.id}/edit`}
                    className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Modifier le token
                  </Link>
                  <Link
                    to={`/tokens/${token.id}/liquidity/add`}
                    className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors"
                  >
                    Ajouter de la liquidité
                  </Link>
                  <Link
                    to={`/tokens/${token.id}/marketing`}
                    className="block w-full px-4 py-2 bg-purple-600 text-white text-center rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Outils marketing
                  </Link>
                  <button
                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-center rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Exporter les données
                  </button>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Informations
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Contrat</div>
                    <div className="text-sm text-gray-900 dark:text-white font-mono break-all">
                      {token.address}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Décimales</div>
                    <div className="text-sm text-gray-900 dark:text-white">18</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Standard</div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {token.blockchain === 'ethereum' || token.blockchain === 'polygon' || token.blockchain === 'arbitrum'
                        ? 'ERC-20'
                        : token.blockchain === 'bsc'
                          ? 'BEP-20'
                          : token.blockchain === 'solana'
                            ? 'SPL'
                            : 'Token standard'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Créé le</div>
                    <div className="text-sm text-gray-900 dark:text-white">{formatDate(token.createdAt)}</div>
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
