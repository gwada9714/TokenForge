import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '@/components';

interface StakingPool {
    id: string;
    name: string;
    totalStaked: string;
    apy: number;
    lockPeriod: number; // en jours (0 = flexible)
    minStake: string;
    participants: number;
    status: 'active' | 'paused' | 'ended';
    createdAt: string;
    endDate?: string;
}

interface StakingPosition {
    id: string;
    poolId: string;
    poolName: string;
    amount: string;
    rewards: string;
    startDate: string;
    endDate?: string;
    status: 'active' | 'locked' | 'ended';
}

const StakingManagerPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    // Données simulées du token
    const [tokenData] = useState({
        id: id || '1',
        name: 'My First Token',
        symbol: 'MFT',
        blockchain: 'ethereum',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        balance: '250,000',
    });

    // Données simulées des pools de staking
    const [stakingPools, setStakingPools] = useState<StakingPool[]>([
        {
            id: '1',
            name: 'Pool Standard',
            totalStaked: '500,000',
            apy: 12,
            lockPeriod: 0,
            minStake: '100',
            participants: 45,
            status: 'active',
            createdAt: '2025-01-15T10:30:00Z',
        },
        {
            id: '2',
            name: 'Pool Premium',
            totalStaked: '750,000',
            apy: 18,
            lockPeriod: 30,
            minStake: '1,000',
            participants: 28,
            status: 'active',
            createdAt: '2025-02-01T14:45:00Z',
        },
        {
            id: '3',
            name: 'Pool Long-terme',
            totalStaked: '1,250,000',
            apy: 25,
            lockPeriod: 90,
            minStake: '5,000',
            participants: 12,
            status: 'active',
            createdAt: '2025-02-15T09:15:00Z',
        },
    ]);

    // Données simulées des positions de staking de l'utilisateur
    const [userStakingPositions, setUserStakingPositions] = useState<StakingPosition[]>([
        {
            id: '101',
            poolId: '1',
            poolName: 'Pool Standard',
            amount: '5,000',
            rewards: '75',
            startDate: '2025-02-20T10:30:00Z',
            status: 'active',
        },
        {
            id: '102',
            poolId: '3',
            poolName: 'Pool Long-terme',
            amount: '10,000',
            rewards: '120',
            startDate: '2025-02-25T14:45:00Z',
            endDate: '2025-05-26T14:45:00Z',
            status: 'locked',
        },
    ]);

    // État pour le formulaire de création de pool
    const [newPoolForm, setNewPoolForm] = useState({
        name: '',
        apy: 10,
        lockPeriod: 0,
        minStake: '',
        endDate: '',
    });

    // État pour le formulaire de staking
    const [stakeForm, setStakeForm] = useState({
        poolId: '',
        amount: '',
    });

    // Formatage de la date
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    // Mise à jour du formulaire de création de pool
    const handleNewPoolChange = (field: keyof typeof newPoolForm) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setNewPoolForm({
            ...newPoolForm,
            [field]: field === 'apy' || field === 'lockPeriod' ? Number(e.target.value) : e.target.value,
        });
    };

    // Soumission du formulaire de création de pool
    const handleCreatePool = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Création de pool simulée: ${newPoolForm.name} avec APY de ${newPoolForm.apy}%`);

        // Ajout du nouveau pool (simulation)
        const newPool: StakingPool = {
            id: `${stakingPools.length + 1}`,
            name: newPoolForm.name,
            totalStaked: '0',
            apy: newPoolForm.apy,
            lockPeriod: newPoolForm.lockPeriod,
            minStake: newPoolForm.minStake,
            participants: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            endDate: newPoolForm.endDate ? new Date(newPoolForm.endDate).toISOString() : undefined,
        };

        setStakingPools([...stakingPools, newPool]);

        // Réinitialisation du formulaire
        setNewPoolForm({
            name: '',
            apy: 10,
            lockPeriod: 0,
            minStake: '',
            endDate: '',
        });
    };

    // Mise à jour du formulaire de staking
    const handleStakeFormChange = (field: keyof typeof stakeForm) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setStakeForm({
            ...stakeForm,
            [field]: e.target.value,
        });
    };

    // Soumission du formulaire de staking
    const handleStake = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedPool = stakingPools.find(pool => pool.id === stakeForm.poolId);

        if (!selectedPool) {
            alert('Veuillez sélectionner un pool de staking');
            return;
        }

        alert(`Staking simulé: ${stakeForm.amount} ${tokenData.symbol} dans ${selectedPool.name}`);

        // Ajout de la nouvelle position (simulation)
        const newPosition: StakingPosition = {
            id: `${userStakingPositions.length + 103}`,
            poolId: selectedPool.id,
            poolName: selectedPool.name,
            amount: stakeForm.amount,
            rewards: '0',
            startDate: new Date().toISOString(),
            status: selectedPool.lockPeriod > 0 ? 'locked' : 'active',
        };

        if (selectedPool.lockPeriod > 0) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + selectedPool.lockPeriod);
            newPosition.endDate = endDate.toISOString();
        }

        setUserStakingPositions([...userStakingPositions, newPosition]);

        // Mise à jour du total staké dans le pool (simulation)
        setStakingPools(stakingPools.map(pool => {
            if (pool.id === selectedPool.id) {
                const currentTotal = parseInt(pool.totalStaked.replace(/,/g, ''));
                const stakeAmount = parseInt(stakeForm.amount.replace(/,/g, ''));
                return {
                    ...pool,
                    totalStaked: (currentTotal + stakeAmount).toLocaleString(),
                    participants: pool.participants + 1,
                };
            }
            return pool;
        }));

        // Réinitialisation du formulaire
        setStakeForm({
            poolId: '',
            amount: '',
        });
    };

    // Réclamation des récompenses
    const claimRewards = (positionId: string) => {
        alert(`Réclamation des récompenses pour la position ${positionId}`);

        // Mise à jour des récompenses (simulation)
        setUserStakingPositions(userStakingPositions.map(position => {
            if (position.id === positionId) {
                return {
                    ...position,
                    rewards: '0',
                };
            }
            return position;
        }));
    };

    // Retrait du staking
    const unstake = (positionId: string) => {
        const position = userStakingPositions.find(pos => pos.id === positionId);

        if (!position) return;

        if (position.status === 'locked') {
            alert('Cette position est verrouillée et ne peut pas être retirée avant la fin de la période de verrouillage');
            return;
        }

        alert(`Retrait du staking pour la position ${positionId}`);

        // Suppression de la position (simulation)
        setUserStakingPositions(userStakingPositions.filter(pos => pos.id !== positionId));

        // Mise à jour du total staké dans le pool (simulation)
        setStakingPools(stakingPools.map(pool => {
            if (pool.id === position.poolId) {
                const currentTotal = parseInt(pool.totalStaked.replace(/,/g, ''));
                const stakeAmount = parseInt(position.amount.replace(/,/g, ''));
                return {
                    ...pool,
                    totalStaked: (currentTotal - stakeAmount).toLocaleString(),
                    participants: pool.participants - 1,
                };
            }
            return pool;
        }));
    };

    // Calcul du total staké par l'utilisateur
    const totalUserStaked = userStakingPositions.reduce(
        (sum, position) => sum + parseInt(position.amount.replace(/,/g, '')),
        0
    ).toLocaleString();

    // Calcul des récompenses totales de l'utilisateur
    const totalUserRewards = userStakingPositions.reduce(
        (sum, position) => sum + parseInt(position.rewards.replace(/,/g, '')),
        0
    ).toLocaleString();

    return (
        <>
            <SEOHead
                title={`Gestion du Staking - ${tokenData.name} (${tokenData.symbol})`}
                description="Gérez les pools de staking de votre token, configurez les récompenses et suivez les positions de staking."
            />

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* En-tête */}
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <Link
                                to={`/tokens/${tokenData.id}`}
                                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 mr-2"
                            >
                                &larr; Retour au token
                            </Link>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Gestion du Staking
                                </h1>
                                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
                                    {tokenData.name} ({tokenData.symbol})
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Balance disponible:</span>
                                <span className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
                                    {tokenData.balance} {tokenData.symbol}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Colonne de gauche - Pools de staking */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Pools de Staking
                                </h2>
                                {stakingPools.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Aucun pool de staking n'a été créé pour ce token.
                                        </p>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                                            Créez un pool de staking pour permettre aux utilisateurs de gagner des récompenses.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Staké</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">APY</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Verrouillage</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Participants</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {stakingPools.map((pool) => (
                                                    <tr key={pool.id}>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {pool.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                Min: {pool.minStake} {tokenData.symbol}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {pool.totalStaked} {tokenData.symbol}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                                {pool.apy}%
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            {pool.lockPeriod > 0 ? (
                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    {pool.lockPeriod} jours
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    Flexible
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {pool.participants}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                                                onClick={() => setStakeForm({ ...stakeForm, poolId: pool.id })}
                                                            >
                                                                Staker
                                                            </button>
                                                            <button
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                onClick={() => alert(`Modifier le pool ${pool.name}`)}
                                                            >
                                                                Modifier
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Positions de staking de l'utilisateur */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Mes Positions de Staking
                                </h2>
                                {userStakingPositions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Vous n'avez pas encore de positions de staking.
                                        </p>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                                            Stakez vos tokens pour gagner des récompenses.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pool</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Récompenses</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date de début</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {userStakingPositions.map((position) => (
                                                    <tr key={position.id}>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {position.poolName}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {position.amount} {tokenData.symbol}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                                {position.rewards} {tokenData.symbol}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {formatDate(position.startDate)}
                                                            </div>
                                                            {position.endDate && (
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Jusqu'au {formatDate(position.endDate)}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${position.status === 'active'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                : position.status === 'locked'
                                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                                }`}>
                                                                {position.status === 'active' && 'Actif'}
                                                                {position.status === 'locked' && 'Verrouillé'}
                                                                {position.status === 'ended' && 'Terminé'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            {parseInt(position.rewards.replace(/,/g, '')) > 0 && (
                                                                <button
                                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                                                                    onClick={() => claimRewards(position.id)}
                                                                >
                                                                    Réclamer
                                                                </button>
                                                            )}
                                                            <button
                                                                className={`${position.status === 'locked'
                                                                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                                    : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                                    }`}
                                                                disabled={position.status === 'locked'}
                                                                onClick={() => position.status !== 'locked' && unstake(position.id)}
                                                            >
                                                                Retirer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Formulaire de staking */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Staker des Tokens
                                </h2>
                                <form onSubmit={handleStake}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label htmlFor="poolId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Pool de Staking
                                            </label>
                                            <select
                                                id="poolId"
                                                value={stakeForm.poolId}
                                                onChange={handleStakeFormChange('poolId')}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                                required
                                            >
                                                <option value="">Sélectionnez un pool</option>
                                                {stakingPools.map((pool) => (
                                                    <option key={pool.id} value={pool.id}>
                                                        {pool.name} - {pool.apy}% APY {pool.lockPeriod > 0 ? `(${pool.lockPeriod} jours)` : '(Flexible)'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Montant à staker
                                            </label>
                                            <input
                                                type="text"
                                                id="amount"
                                                value={stakeForm.amount}
                                                onChange={handleStakeFormChange('amount')}
                                                placeholder={`Ex: 1000 ${tokenData.symbol}`}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Staker
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Colonne de droite - Statistiques et création de pool */}
                        <div className="space-y-8">
                            {/* Statistiques de staking */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Statistiques de Staking
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Total staké (tous pools)</div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stakingPools.reduce((sum, pool) => sum + parseInt(pool.totalStaked.replace(/,/g, '')), 0).toLocaleString()} {tokenData.symbol}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Vos tokens stakés</div>
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                                            {totalUserStaked} {tokenData.symbol}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            ({(parseInt(totalUserStaked.replace(/,/g, '')) / parseInt(tokenData.balance.replace(/,/g, '')) * 100).toFixed(2)}% de votre balance)
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Vos récompenses en attente</div>
                                        <div className="text-lg font-medium text-green-600 dark:text-green-400">
                                            {totalUserRewards} {tokenData.symbol}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">APY moyen</div>
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                                            {(stakingPools.reduce((sum, pool) => sum + pool.apy, 0) / stakingPools.length).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Création de pool de staking */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                    Créer un Pool de Staking
                                </h2>
                                <form onSubmit={handleCreatePool}>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Nom du pool
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                value={newPoolForm.name}
                                                onChange={handleNewPoolChange('name')}
                                                placeholder="Ex: Pool Premium"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="apy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                APY (%)
                                            </label>
                                            <input
                                                type="number"
                                                id="apy"
                                                value={newPoolForm.apy}
                                                onChange={handleNewPoolChange('apy')}
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="lockPeriod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Période de verrouillage (jours)
                                            </label>
                                            <input
                                                type="number"
                                                id="lockPeriod"
                                                value={newPoolForm.lockPeriod}
                                                onChange={handleNewPoolChange('lockPeriod')}
                                                min="0"
                                                max="365"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                            />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                0 = pas de verrouillage (staking flexible)
                                            </p>
                                        </div>
                                        <div>
                                            <label htmlFor="minStake" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Mise minimum
                                            </label>
                                            <input
                                                type="text"
                                                id="minStake"
                                                value={newPoolForm.minStake}
                                                onChange={handleNewPoolChange('minStake')}
                                                placeholder={`Ex: 100 ${tokenData.symbol}`}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Date de fin (optionnel)
                                            </label>
                                            <input
                                                type="date"
                                                id="endDate"
                                                value={newPoolForm.endDate}
                                                onChange={handleNewPoolChange('endDate')}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                            />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Laissez vide pour un pool sans date de fin
                                            </p>
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                Créer le pool de staking
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StakingManagerPage;
