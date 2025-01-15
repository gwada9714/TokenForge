// src/pages/Tokens.tsx
import { useTokens } from '../hooks/useTokens';
import { Link } from 'react-router-dom';

interface Token {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
}

const Tokens = () => {
  const { tokens, isLoading, error } = useTokens();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Une erreur est survenue lors du chargement des tokens
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Aucun token trouvé</h2>
        <p className="text-gray-600 mb-6">
          Vous n'avez pas encore créé de token
        </p>
        <Link to="/tokens/create" className="btn btn-primary">
          Créer mon premier token
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mes Tokens</h1>
        <Link to="/tokens/create" className="btn btn-primary">
          Créer un Token
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tokens.map((token: Token) => (
          <Link 
            key={token.address} 
            to={`/tokens/${token.address}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold">{token.name}</h3>
            <p className="text-gray-600">{token.symbol}</p>
            <p className="text-sm text-gray-500 truncate mt-2">
              {token.address}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              Supply Total: {token.totalSupply} {token.symbol}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Tokens;