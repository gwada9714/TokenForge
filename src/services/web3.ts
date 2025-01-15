import { ethers } from 'ethers';
import { TOKEN_ABI, FACTORY_ABI } from '../constants';
import { getFactoryAddress } from '../config/web3Config';
import type { TokenContract, FactoryContract } from '../types/contracts';

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
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

        this.provider = new ethers.BrowserProvider(window.ethereum);
        
        // Attendre que la connexion soit établie
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.signer = await this.provider.getSigner();

      } finally {
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  async getSigner(): Promise<ethers.JsonRpcSigner> {
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
    if (!ethers.isAddress(address)) {
      throw new Error('Adresse de contrat invalide');
    }
    return new ethers.Contract(
      address,
      TOKEN_ABI,
      signer
    ) as TokenContract;
  }

  async executeTokenTransaction(params: {
    type: 'transfer' | 'mint' | 'burn';
    tokenAddress: string;
    amount: string;
    recipient?: string;
  }) {
    const contract = await this.getTokenContract(params.tokenAddress);
    const amount = ethers.parseUnits(params.amount, 18);

    switch (params.type) {
      case 'transfer':
        if (!params.recipient) throw new Error('Destinataire requis');
        return await contract.transfer(params.recipient, amount);
      case 'mint':
        const signer = await this.getSigner();
        return await contract.mint(await signer.getAddress(), amount);
      case 'burn':
        return await contract.burn(amount);
    }
  }
}

export const web3Service = new Web3Service(); 