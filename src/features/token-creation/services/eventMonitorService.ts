import { createPublicClient, http, type Log, type TransactionReceipt } from 'viem';
import { BlockchainNetwork } from '../components/DeploymentOptions';
import ErrorService from '../services/ErrorService';

export interface TokenEvent {
  type: 'Transfer' | 'Mint' | 'Burn' | 'TaxCollected';
  from: string;
  to: string;
  amount: bigint;
  timestamp: number;
}

export class EventMonitorService {
  private clients: Map<BlockchainNetwork, ReturnType<typeof createPublicClient>> = new Map();

  constructor(private readonly rpcUrls: Record<BlockchainNetwork, string>) {
    const errorService = ErrorService.getInstance();
    
    // Valider et initialiser les clients pour chaque réseau
    Object.entries(rpcUrls).forEach(([network, url]) => {
      try {
        // Valider l'URL RPC
        if (!url || !url.startsWith('http')) {
          throw new Error(`URL RPC invalide pour le réseau ${network}`);
        }

        // Créer le client avec fallback vers un provider public
        const transport = http(url, {
          timeout: 10000,
          retryCount: 3,
          retryDelay: 1000
        });

        this.clients.set(network as BlockchainNetwork, createPublicClient({
          transport,
          chain: this.getChainConfig(network as BlockchainNetwork)
        }));

      } catch (error) {
        errorService.handleError(error, {
          network,
          url,
          context: 'EventMonitorService initialization'
        });
        
        // Utiliser un provider public comme fallback
        const fallbackUrl = this.getFallbackRPC(network as BlockchainNetwork);
        this.clients.set(
          network as BlockchainNetwork,
          createPublicClient({
            transport: http(fallbackUrl),
            chain: this.getChainConfig(network as BlockchainNetwork)
          })
        );
      }
    });
  }

  async monitorTokenEvents(
    network: BlockchainNetwork,
    tokenAddress: `0x${string}`,
    fromBlock: bigint
  ): Promise<TokenEvent[]> {
    const client = this.clients.get(network);
    if (!client) throw new Error(`Client non configuré pour le réseau ${network}`);

    try {
      const logs = await client.getLogs({
        address: tokenAddress,
        fromBlock,
        toBlock: 'latest'
      });

      return this.parseTokenEvents(logs);
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      return [];
    }
  }

  async getTransactionEvents(
    network: BlockchainNetwork,
    txHash: `0x${string}`
  ): Promise<TokenEvent[]> {
    const client = this.clients.get(network);
    if (!client) throw new Error(`Client non configuré pour le réseau ${network}`);

    try {
      const receipt = await client.getTransactionReceipt({ hash: txHash });
      return this.parseTransactionEvents(receipt);
    } catch (error) {
      console.error('Erreur lors de la récupération des événements de transaction:', error);
      return [];
    }
  }

  private parseTokenEvents(logs: Log[]): TokenEvent[] {
    return logs.map(log => {
      // Implémenter le parsing des événements selon les types
      // Pour l'instant, on retourne un événement Transfer par défaut
      return {
        type: 'Transfer',
        from: log.address,
        to: log.address,
        amount: BigInt(0),
        timestamp: Date.now()
      };
    });
  }

  private parseTransactionEvents(receipt: TransactionReceipt): TokenEvent[] {
    // Implémenter le parsing des événements de transaction
    return [];
  }

  private getChainConfig(network: BlockchainNetwork) {
    // Configuration spécifique à chaque réseau
    const configs: Record<BlockchainNetwork, any> = {
      ethereum: mainnet,
      bsc: bsc,
      polygon: polygon,
      avalanche: avalanche,
      arbitrum: arbitrum,
      solana: {
        id: 1399811149,
        name: 'Solana',
        nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
        rpcUrls: { default: { http: ['https://api.mainnet-beta.solana.com'] } }
      }
    };
    return configs[network];
  }

  private getFallbackRPC(network: BlockchainNetwork): string {
    // URLs RPC publiques de fallback
    const fallbackUrls: Record<BlockchainNetwork, string> = {
      ethereum: 'https://eth.llamarpc.com',
      bsc: 'https://bsc-dataseed.binance.org',
      polygon: 'https://polygon-rpc.com',
      avalanche: 'https://api.avax.network/ext/bc/C/rpc',
      arbitrum: 'https://arb1.arbitrum.io/rpc',
      solana: 'https://api.mainnet-beta.solana.com'
    };
    return fallbackUrls[network];
  }
}
