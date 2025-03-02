import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '@/components';

interface AntiRugpullConfig {
    liquidityLocking: {
        enabled: boolean;
        percentage: number;
        duration: number;
    };
    timelock: {
        enabled: boolean;
        delay: number;
    };
    teamTokens: {
        enabled: boolean;
        vestingPeriod: number;
        initialRelease: number;
    };
    multiSig: {
        enabled: boolean;
        requiredSignatures: number;
    };
    transparencyBadge: {
        enabled: boolean;
        level: 'basic' | 'advanced' | 'premium';
    };
}

export const AntiRugpullConfiguratorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState<string>('liquidity');

    // Configuration initiale
    const [config, setConfig] = useState<AntiRugpullConfig>({
        liquidityLocking: {
            enabled: true,
            percentage: 80,
            duration: 180, // jours
        },
        timelock: {
            enabled: true,
            delay: 48, // heures
        },
        teamTokens: {
            enabled: true,
            vestingPeriod: 365, // jours
            initialRelease: 10, // pourcentage
        },
        multiSig: {
            enabled: false,
            requiredSignatures: 2,
        },
        transparencyBadge: {
            enabled: true,
            level: 'advanced',
        },
    });

    // Mise à jour de la configuration
    const updateConfig = (section: keyof AntiRugpullConfig, field: string, value: any) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    // Calcul du score de sécurité
    const calculateSecurityScore = (): number => {
        let score = 0;

        // Liquidity locking
        if (config.liquidityLocking.enabled) {
            score += 20 * (config.liquidityLocking.percentage / 100);
            score += Math.min(10, (config.liquidityLocking.duration / 365) * 10);
        }

        // Timelock
        if (config.timelock.enabled) {
            score += 15;
            score += Math.min(5, (config.timelock.delay / 72) * 5);
        }

        // Team tokens vesting
        if (config.teamTokens.enabled) {
            score += 15;
            score += Math.min(5, (config.teamTokens.vestingPeriod / 365) * 5);
            score -= Math.min(5, (config.teamTokens.initialRelease / 20) * 5);
        }

        // Multi-sig
        if (config.multiSig.enabled) {
            score += 15;
            score += Math.min(5, config.multiSig.requiredSignatures);
        }

        // Transparency badge
        if (config.transparencyBadge.enabled) {
            score += config.transparencyBadge.level === 'basic' ? 5 :
                config.transparencyBadge.level === 'advanced' ? 10 : 15;
        }

        return Math.min(100, Math.round(score));
    };

    // Obtenir la classe de couleur en fonction du score
    const getScoreColorClass = (score: number): string => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <>
            <SEOHead
                title="Configurateur Anti-Rugpull - TokenForge"
                description="Protégez votre communauté avec des mécanismes anti-rugpull avancés. Configurez le verrouillage de liquidité, timelock, et plus encore."
            />

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                Configurateur Anti-Rugpull
                            </h1>
                            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                                Protégez votre communauté avec des mécanismes de sécurité avancés
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3">
                                <div className="mr-3">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Score de sécurité</div>
                                    <div className={`text-2xl font-bold ${getScoreColorClass(calculateSecurityScore())}`}>
                                        {calculateSecurityScore()}/100
                                    </div>
                                </div>
                                <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                    <div
                                        className={`text-xl font-bold ${getScoreColorClass(calculateSecurityScore())}`}
                                    >
                                        {calculateSecurityScore()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        {/* Onglets */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                            {['liquidity', 'timelock', 'team', 'multisig', 'transparency'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === tab
                                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'liquidity' && 'Verrouillage de liquidité'}
                                    {tab === 'timelock' && 'Timelock'}
                                    {tab === 'team' && 'Tokens de l\'équipe'}
                                    {tab === 'multisig' && 'Multi-signature'}
                                    {tab === 'transparency' && 'Badge de transparence'}
                                </button>
                            ))}
                        </div>

                        {/* Contenu des onglets */}
                        <div className="p-6">
                            {/* Verrouillage de liquidité */}
                            {activeTab === 'liquidity' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                Verrouillage de liquidité
                                            </h2>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                Verrouillez un pourcentage de la liquidité pour une période définie
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.liquidityLocking.enabled}
                                                onChange={(e) => updateConfig('liquidityLocking', 'enabled', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    {config.liquidityLocking.enabled && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Pourcentage de liquidité à verrouiller
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="range"
                                                        min="10"
                                                        max="100"
                                                        step="5"
                                                        value={config.liquidityLocking.percentage}
                                                        onChange={(e) => updateConfig('liquidityLocking', 'percentage', parseInt(e.target.value))}
                                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                                    />
                                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white w-12">
                                                        {config.liquidityLocking.percentage}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Durée de verrouillage (jours)
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="range"
                                                        min="30"
                                                        max="730"
                                                        step="30"
                                                        value={config.liquidityLocking.duration}
                                                        onChange={(e) => updateConfig('liquidityLocking', 'duration', parseInt(e.target.value))}
                                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                                    />
                                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white w-12">
                                                        {config.liquidityLocking.duration}j
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Timelock */}
                            {activeTab === 'timelock' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                Timelock
                                            </h2>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                Imposez un délai obligatoire avant l'exécution des fonctions critiques
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.timelock.enabled}
                                                onChange={(e) => updateConfig('timelock', 'enabled', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    {config.timelock.enabled && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Délai de timelock (heures)
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="range"
                                                        min="12"
                                                        max="168"
                                                        step="12"
                                                        value={config.timelock.delay}
                                                        onChange={(e) => updateConfig('timelock', 'delay', parseInt(e.target.value))}
                                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                                    />
                                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white w-12">
                                                        {config.timelock.delay}h
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tokens de l'équipe */}
                            {activeTab === 'team' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                Vesting des tokens de l'équipe
                                            </h2>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                Limitez la vente des tokens de l'équipe avec un calendrier de libération
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.teamTokens.enabled}
                                                onChange={(e) => updateConfig('teamTokens', 'enabled', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    {config.teamTokens.enabled && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Période de vesting (jours)
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="range"
                                                        min="90"
                                                        max="1095"
                                                        step="30"
                                                        value={config.teamTokens.vestingPeriod}
                                                        onChange={(e) => updateConfig('teamTokens', 'vestingPeriod', parseInt(e.target.value))}
                                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                                    />
                                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white w-12">
                                                        {config.teamTokens.vestingPeriod}j
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Libération initiale (%)
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="50"
                                                        step="5"
                                                        value={config.teamTokens.initialRelease}
                                                        onChange={(e) => updateConfig('teamTokens', 'initialRelease', parseInt(e.target.value))}
                                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                                    />
                                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white w-12">
                                                        {config.teamTokens.initialRelease}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Multi-signature */}
                            {activeTab === 'multisig' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                Portefeuille multi-signature
                                            </h2>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                Exigez plusieurs signatures pour exécuter des fonctions critiques
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.multiSig.enabled}
                                                onChange={(e) => updateConfig('multiSig', 'enabled', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    {config.multiSig.enabled && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Nombre de signatures requises
                                                </label>
                                                <div className="flex items-center">
                                                    <input
                                                        type="range"
                                                        min="2"
                                                        max="5"
                                                        step="1"
                                                        value={config.multiSig.requiredSignatures}
                                                        onChange={(e) => updateConfig('multiSig', 'requiredSignatures', parseInt(e.target.value))}
                                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                                    />
                                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white w-12">
                                                        {config.multiSig.requiredSignatures}/5
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Badge de transparence */}
                            {activeTab === 'transparency' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                Badge de transparence
                                            </h2>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                Affichez votre engagement envers la transparence et la sécurité
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.transparencyBadge.enabled}
                                                onChange={(e) => updateConfig('transparencyBadge', 'enabled', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    {config.transparencyBadge.enabled && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                    Niveau de badge
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {['basic', 'advanced', 'premium'].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`border rounded-lg p-4 cursor-pointer ${config.transparencyBadge.level === level
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                    : 'border-gray-200 dark:border-gray-700'
                                                                }`}
                                                            onClick={() => updateConfig('transparencyBadge', 'level', level)}
                                                        >
                                                            <div className="font-medium text-gray-900 dark:text-white capitalize mb-1">
                                                                {level}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                {level === 'basic' && 'Vérification de base du contrat'}
                                                                {level === 'advanced' && 'Vérification avancée + KYC équipe'}
                                                                {level === 'premium' && 'Audit complet + Assurance'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between">
                                <Link
                                    to={`/tokens/${id || ''}`}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Annuler
                                </Link>
                                <button
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Appliquer les configurations
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
