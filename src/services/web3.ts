import { ethers } from 'ethers';
import { TOKEN_ABI, FACTORY_ABI } from '../constants';
import { getFactoryAddress } from '../config/web3Config';
import type { TokenContract, FactoryContract } from '../types/contracts';

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.providers.JsonRpcSigner | null = null;
  private connectionPromise: Promise<void> | null = null;

  async connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = (async () => {
      try {
        if (typeof window === 'undefined' || !window.ethereum) {
          throw new Error('Metamask non détecté');
        }

        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Attendre que la connexion soit établie
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.signer = await this.provider.getSigner();

      } finally {
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  async getSigner(): Promise<ethers.providers.JsonRpcSigner> {
    if (!this.signer) {
      await this.connect();
      if (!this.signer) {
        throw new Error('Impossible de récupérer le signer');
      }
    }
    return this.signer;
  }

  async getFactoryContract(): Promise<FactoryContract> {
    const signer = await this.getSigner();
    const address = getFactoryAddress();
    return new ethers.Contract(
      address,
      FACTORY_ABI,
      signer
    ) as FactoryContract;
  }

  async getTokenContract(address: string): Promise<TokenContract> {
    const signer = await this.getSigner();
    return new ethers.Contract(
      address,
      TOKEN_ABI,
      signer
    ) as TokenContract;
  }

  async getProvider(): Promise<ethers.providers.Web3Provider> {
    if (!this.provider) {
      await this.connect();
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }
    }
    return this.provider;
  }
}

export const web3Service = new Web3Service();