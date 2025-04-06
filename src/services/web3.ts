import { ethers, BrowserProvider, JsonRpcSigner, Contract } from "ethers";
import { TOKEN_ABI, FACTORY_ABI } from "../constants";
import { getFactoryAddress } from "../config/web3Config";
import type { TokenContract, FactoryContract } from "../types/contracts";

export class Web3Service {
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;
  private connectionPromise: Promise<void> | null = null;

  async connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = (async () => {
      try {
        if (typeof window === "undefined" || !window.ethereum) {
          throw new Error("Metamask non détecté");
        }

        this.provider = new BrowserProvider(window.ethereum);

        // Attendre que la connexion soit établie
        await window.ethereum.request({ method: "eth_requestAccounts" });
        this.signer = await this.provider.getSigner();
      } finally {
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  async getSigner(): Promise<JsonRpcSigner> {
    if (!this.signer) {
      await this.connect();
      if (!this.signer) {
        throw new Error("Impossible de récupérer le signer");
      }
    }
    return this.signer;
  }

  async getFactoryContract(): Promise<FactoryContract> {
    const signer = await this.getSigner();
    const address = getFactoryAddress();

    if (!address) {
      throw new Error(
        "Adresse du contrat Factory non configurée pour ce réseau"
      );
    }

    try {
      return new Contract(address, FACTORY_ABI, signer) as FactoryContract;
    } catch (error) {
      console.error("Erreur lors de la création du contrat Factory:", error);
      throw new Error(
        "Impossible de créer le contrat Factory. Vérifiez votre connexion et le réseau sélectionné."
      );
    }
  }

  async getTokenContract(address: string): Promise<TokenContract> {
    if (!ethers.isAddress(address)) {
      throw new Error("Format d'adresse invalide");
    }

    const signer = await this.getSigner();

    try {
      return new Contract(address, TOKEN_ABI, signer) as TokenContract;
    } catch (error) {
      console.error("Erreur lors de la création du contrat Token:", error);
      throw new Error(
        "Impossible de créer le contrat Token. Vérifiez votre connexion et le réseau sélectionné."
      );
    }
  }

  async getProvider(): Promise<BrowserProvider> {
    if (!this.provider) {
      await this.connect();
      if (!this.provider) {
        throw new Error("Provider not initialized");
      }
    }
    return this.provider;
  }
}

export const web3Service = new Web3Service();
