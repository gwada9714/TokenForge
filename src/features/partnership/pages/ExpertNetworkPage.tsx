import React, { useState } from 'react';
import { SEOHead } from '@/components';

export const ExpertNetworkPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

    // Catégories d'experts
    const categories = [
        { id: 'all', name: 'Tous les experts' },
        { id: 'tokenomics', name: 'Tokenomics' },
        { id: 'smart-contracts', name: 'Smart Contracts' },
        { id: 'security', name: 'Sécurité' },
        { id: 'legal', name: 'Juridique' },
        { id: 'marketing', name: 'Marketing' },
        { id: 'defi', name: 'DeFi' },
        { id: 'nft', name: 'NFT' },
    ];

    // Interface pour les experts
    interface Expert {
        id: string;
        name: string;
        title: string;
        company: string;
        category: string;
        rating: number;
        hourlyRate: number;
        availability: string;
        bio: string;
        skills: string[];
        languages: string[];
        image: string;
        projects: {
            name: string;
            description: string;
        }[];
        reviews: {
            author: string;
            rating: number;
            comment: string;
            date: string;
        }[];
    }

    // Liste des experts (données simulées)
    const experts: Expert[] = [
        {
            id: '1',
            name: 'Sophie Martin',
            title: 'Tokenomics Specialist',
            company: 'TokenDesign Labs',
            category: 'tokenomics',
            rating: 4.9,
            hourlyRate: 150,
            availability: 'Disponible dans 3 jours',
            bio: 'Spécialiste en conception de tokenomics avec plus de 5 ans d\'expérience. A travaillé sur plus de 30 projets blockchain réussis, aidant à concevoir des modèles économiques durables et des mécanismes d\'incitation efficaces.',
            skills: ['Conception de tokenomics', 'Modélisation économique', 'Mécanismes d\'incitation', 'Analyse de marché', 'Gouvernance DAO'],
            languages: ['Français', 'Anglais', 'Espagnol'],
            image: '/images/experts/expert1.jpg',
            projects: [
                {
                    name: 'DeFiChain',
                    description: 'Conception du modèle économique et des mécanismes d\'incitation pour une plateforme DeFi majeure.'
                },
                {
                    name: 'GreenToken',
                    description: 'Développement d\'un système de tokenomics pour un projet de compensation carbone sur blockchain.'
                }
            ],
            reviews: [
                {
                    author: 'Jean Dupont',
                    rating: 5,
                    comment: 'Sophie a transformé notre projet avec sa vision claire et sa compréhension profonde des mécanismes d\'incitation. Hautement recommandée!',
                    date: '2025-01-15'
                },
                {
                    author: 'Marie Leclerc',
                    rating: 4.8,
                    comment: 'Excellente expertise en tokenomics et très professionnelle. A livré exactement ce dont nous avions besoin.',
                    date: '2024-12-10'
                }
            ]
        },
        {
            id: '2',
            name: 'Thomas Dubois',
            title: 'Smart Contract Auditor',
            company: 'SecureChain',
            category: 'smart-contracts',
            rating: 4.8,
            hourlyRate: 180,
            availability: 'Disponible immédiatement',
            bio: 'Auditeur de smart contracts certifié avec une expertise en Solidity et Rust. Spécialisé dans l\'identification et la correction des vulnérabilités de sécurité dans les contrats intelligents.',
            skills: ['Solidity', 'Rust', 'Audit de sécurité', 'EVM', 'Hardhat', 'Truffle'],
            languages: ['Français', 'Anglais'],
            image: '/images/experts/expert2.jpg',
            projects: [
                {
                    name: 'SafeVault',
                    description: 'Audit complet de sécurité pour un protocole de prêt DeFi avec plus de 100M$ de TVL.'
                },
                {
                    name: 'NFT Marketplace',
                    description: 'Développement et audit des contrats intelligents pour une place de marché NFT.'
                }
            ],
            reviews: [
                {
                    author: 'Alexandre Moreau',
                    rating: 5,
                    comment: 'Thomas a identifié plusieurs vulnérabilités critiques dans nos contrats que d\'autres auditeurs avaient manquées. Un vrai professionnel!',
                    date: '2025-02-05'
                },
                {
                    author: 'Société BlockFuture',
                    rating: 4.7,
                    comment: 'Excellent travail d\'audit, rapport détaillé et recommandations claires. Nous travaillerons à nouveau avec Thomas.',
                    date: '2024-11-20'
                }
            ]
        },
        {
            id: '3',
            name: 'Camille Bernard',
            title: 'Blockchain Legal Advisor',
            company: 'CryptoLegal',
            category: 'legal',
            rating: 4.7,
            hourlyRate: 200,
            availability: 'Disponible dans 5 jours',
            bio: 'Avocate spécialisée en droit des technologies et blockchain. Conseille les projets crypto sur la conformité réglementaire, la structuration juridique et les questions de propriété intellectuelle.',
            skills: ['Réglementation crypto', 'Conformité KYC/AML', 'Structuration juridique', 'Propriété intellectuelle', 'Smart contracts légaux'],
            languages: ['Français', 'Anglais', 'Allemand'],
            image: '/images/experts/expert3.jpg',
            projects: [
                {
                    name: 'CryptoBank',
                    description: 'Conseil juridique pour l\'obtention d\'une licence d\'établissement de paiement pour une plateforme crypto.'
                },
                {
                    name: 'TokenOffering',
                    description: 'Structuration juridique complète pour une offre de tokens conforme à la réglementation européenne.'
                }
            ],
            reviews: [
                {
                    author: 'Startup BlockInnovate',
                    rating: 5,
                    comment: 'Camille nous a guidés à travers le labyrinthe réglementaire avec expertise et clarté. Son aide a été inestimable.',
                    date: '2025-01-30'
                },
                {
                    author: 'Pierre Leroy',
                    rating: 4.5,
                    comment: 'Excellente connaissance du cadre juridique des cryptomonnaies en Europe. Très réactive et professionnelle.',
                    date: '2024-12-15'
                }
            ]
        },
        {
            id: '4',
            name: 'Lucas Mercier',
            title: 'DeFi Protocol Architect',
            company: 'DeFi Innovations',
            category: 'defi',
            rating: 4.9,
            hourlyRate: 190,
            availability: 'Disponible dans 7 jours',
            bio: 'Architecte de protocoles DeFi avec une expertise en conception de mécanismes financiers décentralisés. Spécialisé dans les protocoles de prêt, d\'échange et de staking.',
            skills: ['Conception de protocoles', 'Solidity', 'Mécanismes DeFi', 'Yield farming', 'AMMs', 'Oracles'],
            languages: ['Français', 'Anglais'],
            image: '/images/experts/expert4.jpg',
            projects: [
                {
                    name: 'YieldMax',
                    description: 'Conception et développement d\'un protocole d\'optimisation de rendement multi-chaînes.'
                },
                {
                    name: 'StableLend',
                    description: 'Architecture d\'un protocole de prêt basé sur des stablecoins avec mécanismes anti-liquidation innovants.'
                }
            ],
            reviews: [
                {
                    author: 'Équipe FinDeFi',
                    rating: 5,
                    comment: 'Lucas a transformé notre vision en un protocole fonctionnel et innovant. Sa compréhension des mécanismes DeFi est impressionnante.',
                    date: '2025-02-10'
                },
                {
                    author: 'Sophie Durand',
                    rating: 4.8,
                    comment: 'Excellent architecte technique avec une vision claire des tendances DeFi. A livré un protocole robuste et bien pensé.',
                    date: '2024-11-05'
                }
            ]
        },
        {
            id: '5',
            name: 'Emma Petit',
            title: 'Blockchain Marketing Strategist',
            company: 'CryptoGrowth',
            category: 'marketing',
            rating: 4.6,
            hourlyRate: 130,
            availability: 'Disponible immédiatement',
            bio: 'Stratège marketing spécialisée dans les projets blockchain et crypto. Expertise en acquisition d\'utilisateurs, community management et stratégies de croissance pour les projets Web3.',
            skills: ['Stratégie marketing', 'Community building', 'Growth hacking', 'Social media', 'Relations publiques', 'Tokenomics marketing'],
            languages: ['Français', 'Anglais', 'Italien'],
            image: '/images/experts/expert5.jpg',
            projects: [
                {
                    name: 'NFT Collection Launch',
                    description: 'Stratégie marketing complète pour le lancement d\'une collection NFT qui a généré 3M$ de ventes.'
                },
                {
                    name: 'DeFi Protocol Growth',
                    description: 'Campagne d\'acquisition d\'utilisateurs pour un protocole DeFi, augmentant la TVL de 200% en 3 mois.'
                }
            ],
            reviews: [
                {
                    author: 'Marc Leblanc',
                    rating: 4.7,
                    comment: 'Emma a développé une stratégie marketing qui a parfaitement résonné avec notre public cible. Résultats exceptionnels!',
                    date: '2025-01-20'
                },
                {
                    author: 'Équipe MetaWorld',
                    rating: 4.5,
                    comment: 'Approche créative et data-driven. Emma comprend vraiment les spécificités du marketing dans l\'espace crypto.',
                    date: '2024-12-05'
                }
            ]
        },
    ];

    // Filtrer les experts en fonction de la recherche et de la catégorie
    const filteredExperts = experts.filter((expert) => {
        const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expert.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
            expert.bio.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || expert.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Fonction pour afficher les étoiles de notation
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars.push(
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            } else if (i - 0.5 <= rating) {
                stars.push(
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            } else {
                stars.push(
                    <svg key={i} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            }
        }
        return stars;
    };

    return (
        <>
            <SEOHead
                title="Réseau d'Experts - TokenForge"
                description="Connectez-vous avec des experts blockchain de premier plan pour vous aider à développer votre projet de token."
            />

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* En-tête */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Réseau d'Experts
                        </h1>
                        <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                            Connectez-vous avec des experts blockchain de premier plan pour vous aider à développer votre projet.
                        </p>
                    </div>

                    {/* Barre de recherche et filtres */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Rechercher un expert
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="search"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white sm:text-sm"
                                        placeholder="Nom, compétence ou mot-clé..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Catégorie
                                </label>
                                <select
                                    id="category"
                                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Liste des experts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {filteredExperts.length > 0 ? (
                            filteredExperts.map((expert) => (
                                <div
                                    key={expert.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => setSelectedExpert(expert)}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden bg-gray-200">
                                                <div className="h-full w-full flex items-center justify-center text-gray-500 text-2xl">
                                                    {expert.name.charAt(0)}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {expert.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {expert.title} • {expert.company}
                                                </p>
                                                <div className="mt-1 flex items-center">
                                                    <div className="flex">
                                                        {renderStars(expert.rating)}
                                                    </div>
                                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                                        {expert.rating.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                                {expert.bio}
                                            </p>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex flex-wrap gap-2">
                                                {expert.skills.slice(0, 3).map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {expert.skills.length > 3 && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        +{expert.skills.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {expert.hourlyRate}€/heure
                                            </span>
                                            <span className="text-xs text-green-600 dark:text-green-400">
                                                {expert.availability}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Aucun expert trouvé</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Essayez de modifier vos critères de recherche ou de sélectionner une autre catégorie.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Comment ça marche */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            Comment ça marche
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    1. Trouvez un expert
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Parcourez notre réseau d'experts vérifiés et trouvez le spécialiste qui correspond à vos besoins.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    2. Discutez de votre projet
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Planifiez une consultation initiale pour discuter de vos besoins et définir les objectifs de votre collaboration.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    3. Collaborez efficacement
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Travaillez ensemble sur notre plateforme sécurisée avec paiements garantis et suivi de projet intégré.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Témoignages */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            Ce que disent nos clients
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                <div className="flex">
                                    {renderStars(5)}
                                </div>
                                <p className="mt-4 text-gray-600 dark:text-gray-300">
                                    "Grâce au réseau d'experts de TokenForge, nous avons pu trouver un spécialiste en tokenomics qui a transformé notre projet. Le processus était simple et la qualité de l'expertise exceptionnelle."
                                </p>
                                <div className="mt-4">
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Marc Dubois
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        CEO, CryptoStart
                                    </p>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                <div className="flex">
                                    {renderStars(4.8)}
                                </div>
                                <p className="mt-4 text-gray-600 dark:text-gray-300">
                                    "Nous cherchions un expert en sécurité blockchain pour auditer nos smart contracts. En moins de 24h, nous avions trouvé le partenaire idéal via TokenForge. Une collaboration qui continue aujourd'hui!"
                                </p>
                                <div className="mt-4">
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Sophie Leroy
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        CTO, DeFiSecure
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de détail d'expert */}
            {selectedExpert && (
                <div className="fixed inset-0 overflow-y-auto z-50">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            {/* Contenu du modal */}
                            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                            {selectedExpert.name}
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {selectedExpert.bio}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => console.log('Contacter', selectedExpert.name)}
                                >
                                    Contacter cet expert
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setSelectedExpert(null)}
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExpertNetworkPage;
