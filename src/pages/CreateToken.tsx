import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTokenDeploy } from '../hooks/useTokenDeploy';
import { toast } from 'react-hot-toast';

const CreateToken = () => {
  const navigate = useNavigate();
  const { deployToken, isDeploying } = useTokenDeploy();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    initialSupply: '',
    isMintable: false,
    isBurnable: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation basique
      if (!formData.name || !formData.symbol || !formData.initialSupply) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }

      if (parseFloat(formData.initialSupply) <= 0) {
        toast.error('Le supply initial doit être supérieur à 0');
        return;
      }

      const deployPromise = deployToken({
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        initialSupply: formData.initialSupply,
        isMintable: formData.isMintable,
        isBurnable: formData.isBurnable,
      });

      await toast.promise(deployPromise, {
        loading: 'Déploiement du token en cours...',
        success: 'Token déployé avec succès !',
        error: 'Erreur lors du déploiement du token',
      });

      // Redirection vers la liste des tokens après le déploiement
      navigate('/tokens');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/tokens')}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold">Créer un nouveau Token</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom du Token
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="ex: My Test Token"
              required
            />
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
              Symbole
            </label>
            <input
              type="text"
              id="symbol"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm uppercase"
              placeholder="ex: MTK"
              maxLength={6}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum 6 caractères, sera automatiquement converti en majuscules
            </p>
          </div>

          <div>
            <label htmlFor="initialSupply" className="block text-sm font-medium text-gray-700">
              Supply Initial
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="initialSupply"
                name="initialSupply"
                value={formData.initialSupply}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="1000000"
                step="0.000000000000000001"
                min="0"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">Tokens</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Nombre total de tokens à créer initialement
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Options avancées</h3>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isMintable"
                  name="isMintable"
                  checked={formData.isMintable}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isMintable" className="ml-2 block text-sm text-gray-700">
                  Mintable
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isBurnable"
                  name="isBurnable"
                  checked={formData.isBurnable}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isBurnable" className="ml-2 block text-sm text-gray-700">
                  Burnable
                </label>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              {formData.isMintable && "• Vous pourrez créer de nouveaux tokens après le déploiement"}
              {formData.isMintable && formData.isBurnable && <br />}
              {formData.isBurnable && "• Vous pourrez détruire des tokens existants"}
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isDeploying}
              className="w-full btn btn-primary"
            >
              {isDeploying ? 'Déploiement en cours...' : 'Créer le Token'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Informations importantes</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          <li>Le token sera déployé sur le réseau actuellement sélectionné dans votre wallet</li>
          <li>Tous les tokens seront initialement envoyés à votre adresse</li>
          <li>Le token suivra le standard ERC20</li>
          <li>Assurez-vous d'avoir assez de fonds pour couvrir les frais de déploiement</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateToken;
