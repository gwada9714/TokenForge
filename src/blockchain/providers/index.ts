import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { chainConfigs } from './config';
import { Connection } from '@solana/web3.js';

/**
 * Factory pour les providers viem (EVM)
 * Crée un client public et un client wallet pour une chaîne spécifique
 */
export const createEvmProvider = (chainName: string, walletProvider?: any) => {
  const config = chainConfigs[chainName as keyof typeof chainConfigs];
  if (!config || chainName === 'solana') {
    throw new Error(`Chain ${chainName} not supported or not configured correctly`);
  }

  // Utiliser la chaîne viem directement si disponible, sinon utiliser une configuration par défaut
  const chain = 'chain' in config ? config.chain : undefined;
  
  const publicClient = createPublicClient({
    chain,
    transport: http(config.rpcUrls[0]),
  });

  // Si un provider wallet est fourni, créer également un wallet client
  let walletClient = null;
  if (walletProvider) {
    walletClient = createWalletClient({
      chain,
      transport: custom(walletProvider),
    });
  }

  return { publicClient, walletClient };
};

/**
 * Factory pour Solana
 * Crée une connexion Solana
 */
export const createSolanaProvider = () => {
  const config = chainConfigs.solana;
  return new Connection(config.rpcUrls[0], 'confirmed');
};
