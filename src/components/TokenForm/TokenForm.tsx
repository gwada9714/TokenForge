import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useTokenFactory } from '../../hooks/useTokenFactory';
import { toast } from 'react-hot-toast';

interface TokenFormData {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  maxSupply: string;
  burnable: boolean;
  mintable: boolean;
}

export const TokenForm = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { createToken } = useTokenFactory();
  const [formData, setFormData] = useState<TokenFormData>({
    name: '',
    symbol: '',
    decimals: 18,
    initialSupply: '',
    maxSupply: '',
    burnable: false,
    mintable: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await createToken(formData);
      toast.success('Token créé avec succès !');
      navigate('/tokens');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast.error('Erreur lors de la création du token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom du Token</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Symbole</label>
        <input
          type="text"
          value={formData.symbol}
          onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Décimales</label>
        <input
          type="number"
          value={formData.decimals}
          onChange={(e) => setFormData({ ...formData, decimals: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          min="0"
          max="18"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Supply Initial</label>
        <input
          type="text"
          value={formData.initialSupply}
          onChange={(e) => setFormData({ ...formData, initialSupply: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.burnable}
            onChange={(e) => setFormData({ ...formData, burnable: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="ml-2">Burnable</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.mintable}
            onChange={(e) => setFormData({ ...formData, mintable: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="ml-2">Mintable</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={!isConnected || isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Création en cours...' : 'Créer le Token'}
      </button>
    </form>
  );
};