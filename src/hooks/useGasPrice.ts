import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';

export const useGasPrice = () => {
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    let mounted = true;

    const fetchGasPrice = async () => {
      if (!publicClient) {
        setIsLoading(false);
        setError(new Error('No public client available'));
        return;
      }

      try {
        setIsLoading(true);
        const price = await publicClient.getGasPrice();
        
        if (mounted) {
          setGasPrice(price);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch gas price'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Fetch initial gas price
    fetchGasPrice();

    // Update gas price every 15 seconds
    const interval = setInterval(fetchGasPrice, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [publicClient]);

  return { gasPrice, isLoading, error };
};

export default useGasPrice;
