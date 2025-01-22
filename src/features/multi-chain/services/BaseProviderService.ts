import { Connection } from '@solana/web3.js';
import { createPublicClient, fallback, http, PublicClient } from 'viem';
import { ChainId, EVMChainConfig, SolanaChainConfig } from '../types/Chain';
import { getChainConfig } from '../config/chains';
import { PROVIDERS, NETWORK_CONFIG } from '../config/dependencies';
import { mainnet, polygon, bsc } from 'viem/chains';

export class BaseProviderService {
  private static evmClients: Map<ChainId, PublicClient> = new Map();
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
  ): Promise<PublicClient> {
    // Vérifier si un client existe déjà
    const existingClient = this.evmClients.get(chainId);
    if (existingClient) {
      return existingClient;
    }

    // Créer les URLs RPC avec les clés API
    const rpcUrls = config.rpcUrls.map(url => 
      url.replace('${ALCHEMY_KEY}', PROVIDERS.ALCHEMY_KEY)
         .replace('${INFURA_KEY}', PROVIDERS.INFURA_KEY)
         .replace('${BSC_NODE_KEY}', PROVIDERS.BSC_NODE_KEY)
         .replace('${POLYGON_NODE_KEY}', PROVIDERS.POLYGON_NODE_KEY)
    );

    // Sélectionner la chaîne appropriée
    const chain = this.getChainConfig(chainId);

    // Créer les transports HTTP pour chaque URL
    const transports = rpcUrls.map(url => http(url));

    // Créer le client avec fallback si plusieurs URLs
    const client = createPublicClient({
      chain,
      transport: transports.length > 1 ? fallback(transports) : transports[0],
    });

    // Stocker le client
    this.evmClients.set(chainId, client);

    return client;
  }

  private static getChainConfig(chainId: ChainId) {
    switch (chainId) {
      case ChainId.ETH:
        return mainnet;
      case ChainId.POLYGON:
        return polygon;
      case ChainId.BSC:
        return bsc;
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
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
    this.evmClients.clear();
    this.solanaConnections.clear();
  }
}
