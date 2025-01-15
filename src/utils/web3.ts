import { ethers } from 'ethers';

interface EthereumEvent {
  readonly chainId: string;
  readonly networkVersion: string;
  readonly selectedAddress: string | null;
}

type EthereumEventCallback = (event: Readonly<EthereumEvent>) => void;

type EthereumEventType = 
  | 'chainChanged'
  | 'networkChanged'
  | 'accountsChanged'
  | 'connect'
  | 'disconnect';

interface EthereumProvider {
  readonly isMetaMask?: boolean;
  readonly chainId?: string;
  readonly networkVersion?: string;
  readonly selectedAddress?: string | null;
  request?: (request: { method: string; params?: Array<any> }) => Promise<any>;
  on?: (event: EthereumEventType, callback: EthereumEventCallback) => void;
  removeListener?: (event: EthereumEventType, callback: EthereumEventCallback) => void;
}

type WindowWithEthereum = Window & typeof globalThis & {
  ethereum?: EthereumProvider;
};

export interface WalletConnection {
  readonly address: string;
  readonly signer: ethers.providers.JsonRpcSigner;
  readonly provider: ethers.providers.Web3Provider;
  readonly chainId: number;
}

export class WalletError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'WalletError';
    Object.setPrototypeOf(this, WalletError.prototype);
  }

  static notFound(): WalletError {
    return new WalletError(
      'Aucun portefeuille trouvé. Veuillez installer MetaMask.',
      'WALLET_NOT_FOUND'
    );
  }

  static userRejected(): WalletError {
    return new WalletError(
      'Connexion refusée par l\'utilisateur',
      'USER_REJECTED'
    );
  }

  static addressError(cause?: unknown): WalletError {
    return new WalletError(
      'Erreur lors de la récupération de l\'adresse',
      'ADDRESS_ERROR',
      cause
    );
  }

  static networkError(cause?: unknown): WalletError {
    return new WalletError(
      'Erreur lors de la récupération du réseau',
      'NETWORK_ERROR',
      cause
    );
  }
}

export const isMetaMaskInstalled = (): boolean => {
  const win = window as WindowWithEthereum;
  return typeof win !== 'undefined' && !!win.ethereum?.isMetaMask;
};

export const getProvider = (): ethers.providers.Web3Provider => {
  if (!isMetaMaskInstalled()) {
    throw WalletError.notFound();
  }
  const win = window as WindowWithEthereum;
  return new ethers.providers.Web3Provider(win.ethereum as any, 'any');
 
};

export const connectWallet = async (): Promise<WalletConnection> => {
  try {
    const provider = getProvider();

    try {
      await provider.send('eth_requestAccounts', []);
    } catch (error: any) {
      if (error?.code === 4001) {
        throw WalletError.userRejected();
      }
      throw error;
    }

    const signer = provider.getSigner();

    let address: string;
    try {
      address = await signer.getAddress();
    } catch (error) {
      throw WalletError.addressError(error);
    }

    let network;
    try {
      network = await provider.getNetwork();
    } catch (error) {
      throw WalletError.networkError(error);
    }

    return {
      address,
      signer,
      provider,
      chainId: network.chainId,
    };
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }
    throw new WalletError(
      'Erreur lors de la connexion au portefeuille',
      'UNKNOWN_ERROR',
      error
    );
  }
};