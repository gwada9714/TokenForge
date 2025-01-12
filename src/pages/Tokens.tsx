// src/pages/Tokens.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Token {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  balance: string;
  createdAt: string;
}

export const Tokens = () => {
  const { isConnected, address } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implémenter la récupération des tokens depuis le smart contract
    const mockTokens: Token[] = [
      {
        address: '0x1234...5678',
        name: 'Test Token',
        symbol: 'TST',
        totalSupply: '1000000',
        balance: '500000',
        createdAt: '2024-03-20',
      },
      // Ajoutez d'autres tokens de test ici
    ];

    setTokens(mockTokens);
    setIsLoading(false);
  }, [address]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Connectez votre wallet</h2>
        <p className="text-gray-600 mb-6">
          Vous devez connecter votre wallet pour voir vos tokens
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes Tokens</h1>
        <Link
          to="/tokens/create"
          className="btn btn-primary"
        >
          Créer un Token
        </Link>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {tokens.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium text-gray-600 mb-4">
            Vous n'avez pas encore de tokens
          </h3>
          <Link
            to="/tokens/create"
            className="btn btn-primary"
          >
            Créer mon premier token
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <Link
              key={token.address}
              to={`/tokens/${token.address}`}
              className="card hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{token.name}</h3>
                  <p className="text-gray-600">{token.symbol}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {token.balance} {token.symbol}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>Supply Total: {token.totalSupply}</p>
                <p>Adresse: {token.address}</p>
                <p>Créé le: {token.createdAt}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <span className="text-blue-600 hover:text-blue-800">
                  Voir les détails →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};