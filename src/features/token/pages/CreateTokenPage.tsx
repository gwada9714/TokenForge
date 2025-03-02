import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '@/components';

export const CreateTokenPage: React.FC = () => {
  const { blockchain } = useParams<{ blockchain?: string }>();
  const [currentStep, setCurrentStep] = useState(blockchain ? 2 : 1);

  // Liste des blockchains supportées
  const blockchains = [
    { id: 'ethereum', name: 'Ethereum', icon: '🔷', color: 'bg-blue-500' },
    { id: 'bsc', name: 'Binance Smart Chain', icon: '🟡', color: 'bg-yellow-500' },
    { id: 'polygon', name: 'Polygon', icon: '🟣', color: 'bg-purple-500' },
    { id: 'avalanche', name: 'Avalanche', icon: '🔺', color: 'bg-red-500' },
    { id: 'solana', name: 'Solana', icon: '🟪', color: 'bg-indigo-500' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔵', color: 'bg-blue-600' },
  ];

  // Navigation entre les étapes
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <>
      <SEOHead
        title="Créer un token - TokenForge"
        description="Créez votre propre token en quelques minutes sur la blockchain de votre choix."
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
              Créer un token
            </h1>

            {/* Indicateur d'étape */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${step <= currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                      {step}
                    </div>
                    <span className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                      {step === 1 && 'Blockchain'}
                      {step === 2 && 'Informations'}
                      {step === 3 && 'Fonctionnalités'}
                      {step === 4 && 'Sécurité'}
                      {step === 5 && 'Confirmation'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative mt-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-between">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`w-5 h-5 rounded-full ${step < currentStep
                          ? 'bg-blue-600'
                          : step === currentStep
                            ? 'border-2 border-blue-600 bg-white dark:bg-gray-800'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contenu de l'étape */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sm:p-8">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Choisissez une blockchain
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {blockchains.map(chain => (
                      <button
                        key={chain.id}
                        onClick={() => nextStep()}
                        className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex flex-col items-center text-center"
                      >
                        <div className={`w-16 h-16 ${chain.color} rounded-full flex items-center justify-center text-white text-2xl mb-4`}>
                          {chain.icon}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {chain.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {chain.id === 'ethereum' && 'Réseau principal Ethereum (ERC-20)'}
                          {chain.id === 'bsc' && 'Binance Smart Chain (BEP-20)'}
                          {chain.id === 'polygon' && 'Réseau Polygon (ERC-20)'}
                          {chain.id === 'avalanche' && 'Réseau Avalanche C-Chain'}
                          {chain.id === 'solana' && 'Réseau Solana (SPL)'}
                          {chain.id === 'arbitrum' && 'Réseau Arbitrum One'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Informations de base
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom du token*
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                        placeholder="Ex: My Awesome Token"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Symbole du token*
                      </label>
                      <input
                        type="text"
                        id="symbol"
                        name="symbol"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                        placeholder="Ex: MAT"
                        maxLength={10}
                        required
                      />
                    </div>
                    <div className="flex justify-between mt-8">
                      <button
                        onClick={prevStep}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={nextStep}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Fonctionnalités avancées
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Mintable</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Permet de créer de nouveaux tokens après le déploiement
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-between mt-8">
                      <button
                        onClick={prevStep}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={nextStep}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Configuration de sécurité
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Protection Anti-Whale</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Limite les transactions et détentions massives
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-between mt-8">
                      <button
                        onClick={prevStep}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={nextStep}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Prévisualisation et confirmation
                  </h2>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Résumé du token</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Votre token est prêt à être déployé. Vérifiez les informations ci-dessous avant de confirmer.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-blue-800 dark:text-blue-200 mb-6">
                      <p>Des frais de déploiement s'appliqueront en fonction de la blockchain choisie.</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Précédent
                    </button>
                    <button
                      className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Déployer le token
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
