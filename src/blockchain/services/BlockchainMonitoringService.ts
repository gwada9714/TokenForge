import { ethers } from 'ethers';
import { CryptocurrencyInfo } from '../types/payment';
import { PaymentService } from './PaymentServiceFixed';
import { solanaMonitor } from './SolanaMonitoringService';

// Adresse du wallet MetaMask centralisé
const WALLET_ADDRESS = '0x92e92b2705edc3d4c7204f961cc659c0';

// ABI minimal pour les événements ERC20
const ERC20_EVENT_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 amount)'
];

// Configuration des providers par blockchain
interface NetworkConfig {
  provider: ethers.Provider;
  nativeCurrency: CryptocurrencyInfo;
  supportedTokens: CryptocurrencyInfo[];
}

/**
 * Service pour le monitoring des transactions sur différentes blockchains
 * Surveille les paiements entrants et met à jour les sessions de paiement
 */
export class BlockchainMonitoringService {
  private networks: Record<string, NetworkConfig> = {};
  private paymentServices: Record<string, PaymentService> = {};
  private isMonitoring: boolean = false;
  
  constructor() {
    this.initNetworks();
  }
  
  /**
   * Initialise les configurations des réseaux
   */
  private async initNetworks() {
    try {
      // Initialiser les réseaux supportés
      const supportedNetworks = [
        'ethereum',
        'binance',
        'polygon',
        'avalanche',
        'solana',
        'arbitrum'
      ];
      
      for (const networkName of supportedNetworks) {
        // Créer le service de paiement pour ce réseau
        const paymentService = new PaymentService(networkName);
        this.paymentServices[networkName] = paymentService;
        
        // Récupérer le provider
        let provider;
        try {
          provider = this.getProvider(networkName);
        } catch (error) {
          console.error(`Error initializing provider for ${networkName}:`, error);
          continue;
        }
        
        // Récupérer les cryptos supportées
        const supportedCryptos = await paymentService.getSupportedCryptocurrencies();
        
        // Trouver la crypto native
        const nativeCurrency = supportedCryptos.find(c => c.isNative);
        
        if (!nativeCurrency) {
          console.error(`No native currency found for ${networkName}`);
          continue;
        }
        
        // Filtrer les tokens (non natifs)
        const supportedTokens = supportedCryptos.filter(c => !c.isNative);
        
        // Ajouter à la configuration des réseaux
        this.networks[networkName] = {
          provider,
          nativeCurrency,
          supportedTokens
        };
      }
      
      console.log(`Initialized ${Object.keys(this.networks).length} blockchain networks for monitoring`);
    } catch (error) {
      console.error('Error initializing networks:', error);
    }
  }
  
  /**
   * Récupère le provider pour un réseau
   * @param networkName Nom du réseau
   * @returns Provider ethers
   */
  private getProvider(networkName: string): ethers.Provider {
    // Dans une implémentation réelle, on utiliserait des variables d'environnement
    // pour les clés API et les URLs des RPC
    switch (networkName.toLowerCase()) {
      case 'ethereum':
        return new ethers.JsonRpcProvider(
          process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY'
        );
      case 'binance':
      case 'bsc':
        return new ethers.JsonRpcProvider(
          process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'
        );
      case 'polygon':
        return new ethers.JsonRpcProvider(
          process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com/'
        );
      case 'avalanche':
        return new ethers.JsonRpcProvider(
          process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc'
        );
      case 'arbitrum':
        return new ethers.JsonRpcProvider(
          process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc'
        );
      case 'solana':
        // Pour Solana, on utiliserait @solana/web3.js
        // Mais pour la cohérence, on retourne un provider ethers vide
        return new ethers.JsonRpcProvider();
      default:
        throw new Error(`Unsupported network: ${networkName}`);
    }
  }
  
  /**
   * Démarre le monitoring des transactions sur toutes les blockchains
   */
  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Starting blockchain transaction monitoring service');
    
    // Pour chaque réseau supporté (sauf Solana qui nécessite une implémentation spécifique)
    Object.entries(this.networks).forEach(([networkName, config]) => {
      if (networkName.toLowerCase() === 'solana') {
        // Utiliser le service de monitoring Solana spécifique
        solanaMonitor.startMonitoring();
        return;
      }
      
      // Monitoring des paiements en crypto native (ETH, BNB, etc.)
      this.monitorNativeTransfers(networkName, config.provider);
      
      // Pour chaque token supporté sur ce réseau
      config.supportedTokens.forEach(token => {
        if (token.address) {
          this.monitorTokenTransfers(networkName, token.address, config.provider);
        }
      });
    });
  }
  
  /**
   * Surveille les transferts de crypto native vers notre wallet
   */
  private monitorNativeTransfers(network: string, provider: ethers.Provider) {
    try {
      // S'abonner aux événements de transfert
      // Note: Dans ethers v6, on utilise directement l'adresse comme filtre
      provider.on({ address: WALLET_ADDRESS }, async (tx: any) => {
        try {
          console.log(`[${network}] Native crypto transfer detected:`, {
            from: tx.from,
            to: tx.to,
            value: ethers.formatEther(tx.value),
            hash: tx.hash
          });
          
          // Vérifier que la transaction est destinée à notre wallet
          if (tx.to?.toLowerCase() !== WALLET_ADDRESS.toLowerCase()) {
            return;
          }
          
          // Traiter la transaction native
          await this.processIncomingNativeTransaction(
            network,
            tx.from,
            tx.value,
            tx.hash
          );
        } catch (error) {
          console.error(`Error processing ${network} native transfer:`, error);
        }
      });
      
      console.log(`Monitoring ${network} native transfers`);
    } catch (error) {
      console.error(`Error setting up ${network} native monitoring:`, error);
    }
  }
  
  /**
   * Surveille les transferts d'un token spécifique vers notre wallet
   */
  private monitorTokenTransfers(network: string, tokenAddress: string, provider: ethers.Provider) {
    try {
      // Créer une interface pour le token
      const tokenInterface = new ethers.Interface(ERC20_EVENT_ABI);
      
      // Créer un filtre pour les événements Transfer vers notre wallet
      const filter = {
        address: tokenAddress,
        topics: [
          ethers.id('Transfer(address,address,uint256)'),
          null,
          ethers.zeroPadValue(ethers.getAddress(WALLET_ADDRESS), 32)
        ]
      };
      
      // S'abonner aux événements
      provider.on(filter, async (log: any) => {
        try {
          // Décoder l'événement
          const parsedLog = tokenInterface.parseLog(log);
          if (!parsedLog) {
            console.error('Failed to parse log');
            return;
          }
          
          const from = parsedLog.args[0]; // from
          const to = parsedLog.args[1];   // to
          const amount = parsedLog.args[2]; // amount
          
          // Vérifier que le destinataire est bien notre wallet
          if (to.toLowerCase() !== WALLET_ADDRESS.toLowerCase()) {
            return;
          }
          
          console.log(`[${network}] Token transfer detected:`, {
            token: tokenAddress,
            from,
            to,
            amount: amount.toString(),
            transactionHash: log.transactionHash
          });
          
          // Traiter la transaction de token
          await this.processIncomingTokenTransaction(
            network,
            tokenAddress,
            from,
            amount,
            log.transactionHash
          );
        } catch (error) {
          console.error(`Error processing ${network} token transfer event:`, error);
        }
      });
      
      console.log(`Monitoring ${network} token transfers for ${tokenAddress}`);
    } catch (error) {
      console.error(`Error setting up ${network} token monitoring for ${tokenAddress}:`, error);
    }
  }
  
  /**
   * Traite une transaction entrante en crypto native
   */
  private async processIncomingNativeTransaction(
    network: string,
    from: string,
    txAmount: bigint,
    txHash: string
  ) {
    try {
      // Dans une implémentation réelle, on rechercherait les sessions de paiement
      // en attente dans Firebase pour ce réseau, cette adresse et cette crypto native
      
      // Pour la démo, on simule une recherche de session
      console.log(`Searching for pending native payment sessions for ${from} on ${network}`);
      
      // Simuler une session trouvée
      const sessionId = `demo-session-${Date.now()}`;
      
      // Confirmer le paiement via le service de paiement
      const paymentService = this.paymentServices[network];
      if (paymentService) {
        const confirmed = await paymentService.confirmPayment(sessionId, txHash);
        console.log(`Payment confirmation result: ${confirmed}`);
      }
    } catch (error) {
      console.error('Error processing incoming native transaction:', error);
    }
  }
  
  /**
   * Traite une transaction entrante de token
   */
  private async processIncomingTokenTransaction(
    network: string,
    tokenAddress: string,
    from: string,
    txAmount: bigint,
    txHash: string
  ) {
    try {
      // Dans une implémentation réelle, on rechercherait les sessions de paiement
      // en attente dans Firebase pour ce réseau, cette adresse et ce token
      
      // Pour la démo, on simule une recherche de session
      console.log(`Searching for pending token payment sessions for ${from} on ${network} with token ${tokenAddress}`);
      
      // Simuler une session trouvée
      const sessionId = `demo-session-${Date.now()}`;
      
      // Confirmer le paiement via le service de paiement
      const paymentService = this.paymentServices[network];
      if (paymentService) {
        const confirmed = await paymentService.confirmPayment(sessionId, txHash);
        console.log(`Payment confirmation result: ${confirmed}`);
      }
    } catch (error) {
      console.error('Error processing incoming token transaction:', error);
    }
  }
  
  /**
   * Arrête le monitoring des transactions
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    console.log('Stopping blockchain transaction monitoring service');
    
    // Retirer tous les listeners
    Object.values(this.networks).forEach(config => {
      config.provider.removeAllListeners();
    });
    
    // Arrêter le monitoring Solana
    solanaMonitor.stopMonitoring();
    
    this.isMonitoring = false;
  }
  
  /**
   * Récupère la configuration d'un réseau
   */
  getNetworkConfig(network: string): NetworkConfig | null {
    return this.networks[network] || null;
  }
  
  /**
   * Récupère les cryptos supportées pour un réseau
   */
  getSupportedCryptocurrencies(network: string): CryptocurrencyInfo[] {
    const config = this.networks[network];
    if (!config) return [];
    
    return [config.nativeCurrency, ...config.supportedTokens];
  }
}

// Créer et exporter une instance singleton
export const blockchainMonitor = new BlockchainMonitoringService();
