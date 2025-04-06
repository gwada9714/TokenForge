import { useState, useEffect, useCallback } from 'react';
import { EventMonitorService, TokenEvent } from '../services/eventMonitorService';
import { BlockchainNetwork } from '../components/DeploymentOptions';
import { useToast } from '@/components/ui/toast';
import { useTokenForgeAuth } from '@/hooks/useAuth';
import { ErrorService } from '../services/errorService';
import { formatEther } from '../utils/ether';

interface TokenEventsState {
  events: TokenEvent[];
  isLoading: boolean;
  error: string | null;
}

export const useTokenEvents = (
  network: BlockchainNetwork,
  tokenAddress?: `0x${string}`,
  refreshInterval = 30000 // 30 secondes par défaut
) => {
  const [state, setState] = useState<TokenEventsState>({
    events: [],
    isLoading: false,
    error: null
  });

  const { showToast } = useToast();
  const { isAuthenticated } = useTokenForgeAuth();
  const eventMonitor = new EventMonitorService({
    ethereum: process.env.NEXT_PUBLIC_ETH_RPC_URL!,
    bsc: process.env.NEXT_PUBLIC_BSC_RPC_URL!,
    polygon: process.env.NEXT_PUBLIC_POLYGON_RPC_URL!,
    avalanche: process.env.NEXT_PUBLIC_AVAX_RPC_URL!,
    solana: process.env.NEXT_PUBLIC_SOL_RPC_URL!,
    arbitrum: process.env.NEXT_PUBLIC_ARB_RPC_URL!
  });

  const fetchEvents = useCallback(async () => {
    if (!tokenAddress || !isAuthenticated) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const latestBlock = await eventMonitor.getLatestBlockNumber(network);
      
      // Calculer le nombre de blocs en fonction du réseau
      const blocksPerDay = {
        ethereum: 7200n,    // ~12s par bloc
        bsc: 28800n,       // ~3s par bloc
        polygon: 43200n,    // ~2s par bloc
        avalanche: 43200n,  // ~2s par bloc
        arbitrum: 43200n,   // ~2s par bloc
        solana: 86400n      // ~1s par bloc
      };

      const fromBlock = latestBlock - blocksPerDay[network];
      const events = await eventMonitor.monitorTokenEvents(
        network,
        tokenAddress,
        fromBlock
      );

      setState(prev => ({
        ...prev,
        events: events.sort((a, b) => b.timestamp - a.timestamp),
        isLoading: false
      }));

      // Notifier des nouveaux événements
      const lastKnownEvent = prev.events[0];
      const newEvents = events.filter(event => 
        !lastKnownEvent || event.timestamp > lastKnownEvent.timestamp
      );

      newEvents.forEach(event => {
        if (event.type === 'TaxCollected') {
          showToast({
            title: 'Taxe collectée',
            description: `${formatEther(event.amount)} tokens collectés`,
            variant: 'success'
          });
        }
      });
    } catch (error) {
      const errorService = ErrorService.getInstance();
      const errorDetails = errorService.handleError(error, {
        network,
        tokenAddress,
        context: 'Event fetching'
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorDetails.message
      }));
    }
  }, [network, tokenAddress, isAuthenticated, showToast]);

  useEffect(() => {
    if (!tokenAddress || !isAuthenticated) return;

    fetchEvents();
    const interval = setInterval(fetchEvents, refreshInterval);

    return () => clearInterval(interval);
  }, [tokenAddress, isAuthenticated, fetchEvents, refreshInterval]);

  const getEventsByType = useCallback((type: TokenEvent['type']) => {
    return state.events.filter(event => event.type === type);
  }, [state.events]);

  return {
    ...state,
    fetchEvents,
    getEventsByType,
    taxEvents: getEventsByType('TaxCollected'),
    transferEvents: getEventsByType('Transfer'),
    mintEvents: getEventsByType('Mint'),
    burnEvents: getEventsByType('Burn')
  };
};
