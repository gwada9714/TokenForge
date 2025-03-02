import { WalletState } from '../types/auth';
import { useAccount, useChainId, useSwitchChain, useConnect, useDisconnect } from 'wagmi';
import { logger } from '../../../utils/firebase-logger';

export function useWalletStatus(): {
  wallet: WalletState | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  address: `0x${string}` | null;
  connect: (address: string, chainId: number) => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
} {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();

  // Determine if on correct network (replace with your network check logic)
  const isCorrectNetwork = chainId === 1 || chainId === 11155111; // Mainnet or Sepolia

  const walletState: WalletState = {
    address: address || null,
    isConnected: Boolean(isConnected),
    isCorrectNetwork,
    chainId
  };

  // Implement actual connect function using wagmi's connectAsync
  const connect = async (_address: string, _chainId: number) => {
    try {
      logger.info({
        category: 'Wallet',
        message: 'Connecting wallet',
        data: { chainId: _chainId }
      });

      // Find the injected connector (MetaMask, etc.)
      const injectedConnector = connectors.find(c => c.id === 'injected');

      if (!injectedConnector) {
        throw new Error('No injected connector found');
      }

      await connectAsync({
        connector: injectedConnector,
        chainId: _chainId
      });

      logger.info({
        category: 'Wallet',
        message: 'Wallet connected successfully'
      });
    } catch (error) {
      logger.error({
        category: 'Wallet',
        message: 'Failed to connect wallet',
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  };

  // Implement actual disconnect function using wagmi's disconnectAsync
  const disconnect = async () => {
    try {
      logger.info({
        category: 'Wallet',
        message: 'Disconnecting wallet'
      });

      await disconnectAsync();

      logger.info({
        category: 'Wallet',
        message: 'Wallet disconnected successfully'
      });
    } catch (error) {
      logger.error({
        category: 'Wallet',
        message: 'Failed to disconnect wallet',
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    try {
      logger.info({
        category: 'Wallet',
        message: 'Switching network',
        data: { targetChainId }
      });

      await switchChain({ chainId: targetChainId });

      logger.info({
        category: 'Wallet',
        message: 'Network switched successfully',
        data: { targetChainId }
      });
    } catch (error) {
      logger.error({
        category: 'Wallet',
        message: 'Failed to switch network',
        error: error instanceof Error ? error : new Error(String(error)),
        data: { targetChainId }
      });
      throw error;
    }
  };

  return {
    wallet: walletState,
    isConnected: Boolean(address),
    isCorrectNetwork,
    address: address || null,
    connect,
    disconnect,
    switchNetwork
  };
}
