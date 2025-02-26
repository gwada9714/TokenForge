import { useState, useEffect } from 'react';
import { useTokenForgeAuth } from '@/features/auth/hooks/useTokenForgeAuth';

interface DashboardStats {
  totalTokens: number;
  tokensTrend: number;
  totalValue: number;
  valueTrend: number;
  activeStaking: number;
  stakingTrend: number;
}

interface Activity {
  id: string;
  type: 'token_creation' | 'transaction' | 'staking' | 'withdrawal';
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: string;
  read: boolean;
}

export const useDashboardData = () => {
  const { state } = useTokenForgeAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTokens: 0,
    tokensTrend: 0,
    totalValue: 0,
    valueTrend: 0,
    activeStaking: 0,
    stakingTrend: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!state.isAuthenticated) return;

      try {
        // TODO: Remplacer par des appels API réels
        // Simuler des données pour le développement
        setStats({
          totalTokens: 5,
          tokensTrend: 20,
          totalValue: 1250,
          valueTrend: 15,
          activeStaking: 3,
          stakingTrend: 10
        });

        setActivities([
          {
            id: '1',
            type: 'token_creation',
            title: 'Création de Token',
            description: 'Token MyToken (MTK) créé avec succès',
            timestamp: '2024-02-24 10:30',
            status: 'completed'
          },
          {
            id: '2',
            type: 'staking',
            title: 'Staking Activé',
            description: 'Stake de 1000 MTK dans le pool principal',
            timestamp: '2024-02-24 09:15',
            status: 'completed'
          },
          {
            id: '3',
            type: 'transaction',
            title: 'Transaction en cours',
            description: 'Transfert de 500 MTK vers 0x1234...',
            timestamp: '2024-02-24 08:45',
            status: 'pending'
          }
        ]);

        setNotifications([
          {
            id: '1',
            type: 'success',
            message: 'Token déployé avec succès',
            timestamp: '2024-02-24 10:30',
            read: false
          },
          {
            id: '2',
            type: 'info',
            message: 'Nouvelle mise à jour disponible',
            timestamp: '2024-02-24 09:00',
            read: true
          },
          {
            id: '3',
            type: 'warning',
            message: 'Vérifiez vos paramètres de staking',
            timestamp: '2024-02-24 08:30',
            read: false
          }
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
      }
    };

    fetchDashboardData();
  }, [state.isAuthenticated]);

  return {
    stats,
    activities,
    notifications
  };
}; 