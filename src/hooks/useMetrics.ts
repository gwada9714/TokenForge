import { useState, useEffect } from 'react';

interface Metrics {
  totalTokens: number;
  totalValue: number;
  activeUsers: number;
  successRate: number;
}

export const useMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    totalTokens: 0,
    totalValue: 0,
    activeUsers: 0,
    successRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Simuler un appel API pour le moment
        const response = await new Promise<Metrics>((resolve) => {
          setTimeout(() => {
            resolve({
              totalTokens: 1234,
              totalValue: 5678900,
              activeUsers: 789,
              successRate: 98.5,
            });
          }, 1000);
        });

        setMetrics(response);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des métriques');
        setLoading(false);
      }
    };

    fetchMetrics();

    // Mise à jour toutes les 30 secondes
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, error };
}; 