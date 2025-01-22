import { providers } from 'ethers';
import { Connection } from '@solana/web3.js';
import { ChainId, EVMChainConfig, SolanaChainConfig } from '../types/Chain';
import { getChainConfig } from '../config/chains';
import { PROVIDERS, NETWORK_CONFIG } from '../config/dependencies';

export class BaseProviderService {
  private static evmProviders: Map<ChainId, providers.Provider> = new Map();
  private static solanaConnections: Map<ChainId, Connection> = new Map();

  static async getProvider(chainId: ChainId) {
    const config = getChainConfig(chainId);
    
    if (!config) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    // Gestion spéciale pour Solana
    if (chainId === ChainId.SOLANA) {
      return this.getSolanaConnection(config as SolanaChainConfig);
    }

    // Pour les chaînes EVM
    return this.getEVMProvider(chainId, config as EVMChainConfig);
  }

  private static async getEVMProvider(
    chainId: ChainId, 
    config: EVMChainConfig
  ): Promise<providers.Provider> {
    // Vérifier si un provider existe déjà
    const existingProvider = this.evmProviders.get(chainId);
    if (existingProvider) {
      return existingProvider;
    }

    // Créer les URLs RPC avec les clés API
    const rpcUrls = config.rpcUrls.map(url => 
      url.replace('${ALCHEMY_KEY}', PROVIDERS.ALCHEMY_KEY)
         .replace('${INFURA_KEY}', PROVIDERS.INFURA_KEY)
         .replace('${BSC_NODE_KEY}', PROVIDERS.BSC_NODE_KEY)
         .replace('${POLYGON_NODE_KEY}', PROVIDERS.POLYGON_NODE_KEY)
    );

    let provider: providers.Provider;

    if (rpcUrls.length > 1) {
      // Si plusieurs URLs sont disponibles, utiliser FallbackProvider
      provider = new providers.FallbackProvider(
        rpcUrls.map(url => new providers.JsonRpcProvider(url)),
        1
      );
    } else {
      // Sinon, utiliser un simple JsonRpcProvider
      provider = new providers.JsonRpcProvider(rpcUrls[0]);
    }

    // Stocker le provider
    this.evmProviders.set(chainId, provider);

    return provider;
  }

  private static getSolanaConnection(
    config: SolanaChainConfig
  ): Connection {
    // Vérifier si une connexion existe déjà
    const existingConnection = this.solanaConnections.get(ChainId.SOLANA);
    if (existingConnection) {
      return existingConnection;
    }

    // Créer une nouvelle connexion
    const connection = new Connection(
      config.rpcUrls[0].replace('${SOLANA_NODE_KEY}', PROVIDERS.SOLANA_NODE_KEY),
      {
        commitment: 'confirmed',
        wsEndpoint: config.wsEndpoint,
        confirmTransactionInitialTimeout: NETWORK_CONFIG.REQUEST_TIMEOUT,
      }
    );

    // Stocker la connexion
    this.solanaConnections.set(ChainId.SOLANA, connection);

    return connection;
  }

  // Méthode utilitaire pour nettoyer les providers
  static clearProviders() {
    this.evmProviders.clear();
    this.solanaConnections.clear();
  }
}
