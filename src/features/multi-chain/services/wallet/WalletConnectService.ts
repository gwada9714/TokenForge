import { createWeb3Modal, defaultConfig } from '@web3modal/wagmi/react'
import { Chain, mainnet, polygon } from 'viem/chains'
import { PaymentNetwork } from '../payment/types/PaymentSession';
import { SUPPORTED_NETWORKS } from '../payment/config/SupportedTokens';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Conversion des réseaux supportés en chaînes wagmi
const supportedChains = SUPPORTED_NETWORKS
  .filter(network => network.network !== PaymentNetwork.SOLANA)
  .map(network => {
    switch (network.network) {
      case PaymentNetwork.ETHEREUM:
        return mainnet;
      case PaymentNetwork.POLYGON:
        return polygon;
      default:
        return null;
    }
  })
  .filter((chain): chain is Chain => chain !== null);

const metadata = {
  name: 'TokenForge',
  description: 'TokenForge Payment System',
  url: 'https://tokenforge.io', 
  icons: ['https://tokenforge.io/icon.png']
}

class WalletConnectService {
  private static instance: WalletConnectService;
  private modal: ReturnType<typeof createWeb3Modal>;
  private config: ReturnType<typeof defaultConfig>;

  private constructor() {
    this.config = defaultConfig({
      metadata,
      projectId,
      chains: supportedChains as [Chain, ...Chain[]],
    });

    this.modal = createWeb3Modal({
      wagmiConfig: this.config,
      projectId,
      themeMode: 'light',
      themeVariables: {
        '--w3m-font-family': 'Roboto, sans-serif',
        '--w3m-accent-color': '#3b82f6'
      }
    });
  }

  public static getInstance(): WalletConnectService {
    if (!WalletConnectService.instance) {
      WalletConnectService.instance = new WalletConnectService();
    }
    return WalletConnectService.instance;
  }

  public getModal() {
    return this.modal;
  }

  public getConfig() {
    return this.config;
  }

  public async connect(): Promise<boolean> {
    try {
      await this.modal.open();
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  public async disconnect(): Promise<boolean> {
    try {
      await this.modal.close();
      return true;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      return false;
    }
  }

  public async switchNetwork(chainId: number): Promise<boolean> {
    try {
      await this.modal.setChain({ chainId });
      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  }
}

export default WalletConnectService;
