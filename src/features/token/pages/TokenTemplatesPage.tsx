import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components';

interface TokenTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    features: string[];
    popularity: number;
    price: string;
    image: string;
    isPremium: boolean;
}

export const TokenTemplatesPage: React.FC = () => {
    // Catégories de templates
    const categories = ['Tous', 'DeFi', 'GameFi', 'Social', 'Rewards', 'Utility'];
    const [activeCategory, setActiveCategory] = useState('Tous');

    // Templates simulés
    const templates: TokenTemplate[] = [
        {
            id: 'basic-erc20',
            name: 'Basic ERC-20',
            description: 'Token ERC-20 standard avec fonctionnalités de base',
            category: 'Utility',
            features: ['Transferable', 'Burnable', 'Mintable'],
            popularity: 4.8,
            price: 'Gratuit',
            image: '/images/templates/basic-erc20.jpg',
            isPremium: false
        },
        {
            id: 'defi-yield',
            name: 'DeFi Yield',
            description: 'Token optimisé pour les protocoles de yield farming',
            category: 'DeFi',
            features: ['Auto-Liquidity', 'Reflection', 'Anti-Whale', 'Timelock'],
            popularity: 4.9,
            price: '0.05 ETH',
            image: '/images/templates/defi-yield.jpg',
            isPremium: true
        },
        {
            id: 'game-token',
            name: 'GameFi Token',
            description: 'Token pour économies de jeux avec mécanismes de récompense',
            category: 'GameFi',
            features: ['Mintable', 'Burnable', 'Role-Based Access', 'Pausable'],
            popularity: 4.7,
            price: '0.04 ETH',
            image: '/images/templates/game-token.jpg',
            isPremium: true
        },
        {
            id: 'social-dao',
            name: 'Social DAO',
            description: 'Token de gouvernance pour organisations autonomes décentralisées',
            category: 'Social',
            features: ['Voting', 'Delegation', 'Proposal Creation', 'Timelock'],
            popularity: 4.6,
            price: '0.06 ETH',
            image: '/images/templates/social-dao.jpg',
            isPremium: true
        },
        {
            id: 'loyalty-rewards',
            name: 'Loyalty Rewards',
            description: 'Token pour programmes de fidélité et récompenses',
            category: 'Rewards',
            features: ['Mintable', 'Expirable', 'Transferable', 'Blacklistable'],
            popularity: 4.5,
            price: '0.03 ETH',
            image: '/images/templates/loyalty-rewards.jpg',
            isPremium: true
        },
        {
            id: 'utility-token',
            name: 'Utility Access',
            description: 'Token pour accès à des services et produits',
            category: 'Utility',
            features: ['Time-Based Access', 'Tiered Permissions', 'Burnable', 'Pausable'],
            popularity: 4.4,
            price: '0.04 ETH',
            image: '/images/templates/utility-token.jpg',
            isPremium: true
        },
    ];

    // Filtrer les templates par catégorie
    const filteredTemplates = activeCategory === 'Tous'
        ? templates
        : templates.filter(template => template.category === activeCategory);

    return (
        <>
            <SEOHead
                title="Templates de Tokens - TokenForge"
                description="Explorez notre bibliothèque de templates de tokens pour accélérer votre déploiement. Templates gratuits et premium pour tous les cas d'usage."
            />

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
                            Templates de Tokens
                        </h1>
                        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                            Accélérez votre déploiement avec nos templates prêts à l'emploi
                        </p>
                    </div>

                    {/* Filtres par catégorie */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium ${activeCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Grille de templates */}
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTemplates.map(template => (
                            <div
                                key={template.id}
                                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 ${template.isPremium ? 'border-2 border-yellow-400 dark:border-yellow-600' : ''
                                    }`}
                            >
                                <div className="h-48 bg-gray-300 dark:bg-gray-700 relative">
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                        <span>Image: {template.image}</span>
                                    </div>
                                    {template.isPremium && (
                                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                                            PREMIUM
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                            {template.category}
                                        </span>
                                        <div className="flex items-center">
                                            <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                                                {template.popularity}
                                            </span>
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {template.name}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4 h-12 overflow-hidden">
                                        {template.description}
                                    </p>
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fonctionnalités:</h3>
                                        <div className="flex flex-wrap gap-1">
                                            {template.features.map((feature, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded"
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {template.price}
                                        </span>
                                        <Link
                                            to={`/create-token?template=${template.id}`}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Utiliser
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-16 bg-blue-600 text-white rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Vous ne trouvez pas ce que vous cherchez ?</h2>
                        <p className="mb-6 max-w-2xl mx-auto">
                            Créez votre token personnalisé avec notre assistant de création étape par étape.
                        </p>
                        <Link
                            to="/create-token"
                            className="inline-block px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Créer un token personnalisé
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};
