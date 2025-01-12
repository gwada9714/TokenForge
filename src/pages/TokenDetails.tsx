import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { truncateAddress } from '../utils';
import { TransferModal } from '../components/modals/TransferModal';

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  circulatingSupply: string;
  owner: string;
  features: {
    burnable: boolean;
    mintable: boolean;
    pausable: boolean;
  };
  transactions: {
    hash: string;
    type: 'transfer' | 'mint' | 'burn';
    from: string;
    to: string;
    amount: string;
    timestamp: string;
  }[];
}

export const TokenDetails = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const { address } = useAccount();
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'holders'>('overview');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showBurnModal, setShowBurnModal] = useState(false);

  useEffect(() => {
    const fetchTokenDetails = async () => {
      try {
        // TODO: Remplacer par l'appel réel au contrat
        const mockToken: TokenInfo = {
          address: tokenId || '0x1234...5678',
          name: 'Test Token',
          symbol: 'TST',
          decimals: 18,
          totalSupply: '1000000',
          circulatingSupply: '950000',
          owner: '0xabcd...efgh',
          features: {
            burnable: true,
            mintable: true,
            pausable: false,
          },
          transactions: [
            {
              hash: '0x123...',
              type: 'transfer',
              from: '0xabcd...',
              to: '0xefgh...',
              amount: '1000',
              timestamp: '2024-03-20T14:30:00',
            },
            // Ajoutez plus de transactions ici
          ],
        };
        setToken(mockToken);
      } catch (err) {
        setError('Erreur lors du chargement des détails du token');
        toast.error('Erreur lors du chargement des détails du token');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenDetails();
  }, [tokenId]);

  const handleTransfer = () => {
    setShowTransferModal(true);
  };

  const handleMint = () => {
    setShowMintModal(true);
  };

  const handleBurn = () => {
    setShowBurnModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papier');
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  );
  
  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="alert alert-error">
        <h3 className="font-bold mb-2">Erreur</h3>
        <p>{error}</p>
        <Link to="/tokens" className="btn btn-sm mt-4">Retour à la liste</Link>
      </div>
    </div>
  );

  if (!token) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Token non trouvé</h2>
      <p className="text-gray-600 mb-6">Le token que vous recherchez n'existe pas ou n'est pas accessible.</p>
      <Link to="/tokens" className="btn btn-primary">Retour à la liste</Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/tokens" className="text-blue-600 hover:text-blue-800">
          ← Retour à la liste
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{token.name}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <span>{token.symbol}</span>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => copyToClipboard(token.address)}
                className="flex items-center gap-1 text-sm hover:text-blue-600"
              >
                {truncateAddress(token.address)}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn btn-outline"
              onClick={handleTransfer}
            >
              Transférer
            </button>
            {token.features.mintable && (
              <button className="btn btn-primary" onClick={handleMint}>
                Mint
              </button>
            )}
            {token.features.burnable && (
              <button className="btn btn-secondary" onClick={handleBurn}>
                Burn
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <h3 className="text-lg font-semibold mb-2 text-blue-900">Supply Total</h3>
            <p className="text-2xl text-blue-800">{token.totalSupply} {token.symbol}</p>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <h3 className="text-lg font-semibold mb-2 text-green-900">Supply Circulant</h3>
            <p className="text-2xl text-green-800">{token.circulatingSupply} {token.symbol}</p>
          </div>
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <h3 className="text-lg font-semibold mb-2 text-purple-900">Décimales</h3>
            <p className="text-2xl text-purple-800">{token.decimals}</p>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-4">
            <button
              className={`pb-2 px-1 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('overview')}
            >
              Aperçu
            </button>
            <button
              className={`pb-2 px-1 ${activeTab === 'transactions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('transactions')}
            >
              Transactions
            </button>
            <button
              className={`pb-2 px-1 ${activeTab === 'holders' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('holders')}
            >
              Détenteurs
            </button>
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Informations du Contrat</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Adresse du Contrat</span>
                  <span className="font-mono">{token.address}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Propriétaire</span>
                  <span className="font-mono">{token.owner}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Fonctionnalités</span>
                  <div className="space-x-2">
                    {token.features.mintable && <span className="badge badge-success">Mintable</span>}
                    {token.features.burnable && <span className="badge badge-warning">Burnable</span>}
                    {token.features.pausable && <span className="badge badge-info">Pausable</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">Hash</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">De</th>
                  <th className="text-left py-3 px-4">À</th>
                  <th className="text-right py-3 px-4">Montant</th>
                  <th className="text-right py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {token.transactions.map((tx) => (
                  <tr key={tx.hash} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => copyToClipboard(tx.hash)}
                        className="font-mono text-sm hover:text-blue-600"
                      >
                        {truncateAddress(tx.hash)}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'transfer' ? 'bg-blue-100 text-blue-800' :
                        tx.type === 'mint' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">
                      <button 
                        onClick={() => copyToClipboard(tx.from)}
                        className="hover:text-blue-600"
                      >
                        {truncateAddress(tx.from)}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">
                      <button 
                        onClick={() => copyToClipboard(tx.to)}
                        className="hover:text-blue-600"
                      >
                        {truncateAddress(tx.to)}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {tx.amount} {token.symbol}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600">
                      {formatDistanceToNow(new Date(tx.timestamp), { 
                        addSuffix: true,
                        locale: fr 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'holders' && (
          <div className="text-center py-12">
            <p className="text-gray-600">Fonctionnalité à venir</p>
          </div>
        )}
      </div>

      {showTransferModal && (
        <TransferModal 
          token={token}
          onClose={() => setShowTransferModal(false)}
          onTransfer={(to, amount) => {
            toast.success('Transfert effectué avec succès');
            setShowTransferModal(false);
          }}
        />
      )}
    </div>
  );
};