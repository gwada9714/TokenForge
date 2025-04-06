import { ethers } from "ethers";
import logger from "../utils/logger";

export class ProviderService {
  private provider: ethers.Provider;

  constructor() {
    const providerUrl = process.env.PROVIDER_URL;
    if (!providerUrl) {
      throw new Error("PROVIDER_URL environment variable is not set");
    }

    try {
      this.provider = new ethers.JsonRpcProvider(providerUrl);
      logger.info("Ethereum provider initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Ethereum provider:", error);
      throw error;
    }
  }

  getProvider(): ethers.Provider {
    return this.provider;
  }

  async getNetwork() {
    try {
      const network = await this.provider.getNetwork();
      return network;
    } catch (error) {
      logger.error("Error getting network information:", error);
      throw error;
    }
  }

  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getFeeData();
      return gasPrice;
    } catch (error) {
      logger.error("Error getting gas price:", error);
      throw error;
    }
  }

  public async getTokenDetails(address: string) {
    try {
      const tokenContract = new ethers.Contract(
        address,
        [
          "function name() view returns (string)",
          "function symbol() view returns (string)",
          "function decimals() view returns (uint8)",
          "function totalSupply() view returns (uint256)",
        ],
        this.provider
      );

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
      ]);

      return {
        address,
        name,
        symbol,
        decimals,
        totalSupply: totalSupply.toString(),
      };
    } catch (error) {
      logger.error("Error getting token details:", error);
      throw error;
    }
  }

  public async getUserTokens(address: string) {
    try {
      // Implémenter la logique pour récupérer les tokens d'un utilisateur
      // Cette implémentation dépendra de votre contrat TokenForgeFactory
      return [];
    } catch (error) {
      logger.error("Error getting user tokens:", error);
      throw error;
    }
  }

  public async deployToken(tokenData: any) {
    try {
      // Implémenter la logique pour déployer un nouveau token
      // Cette implémentation dépendra de votre contrat TokenForgeFactory
      return {
        success: true,
        tokenAddress: "0x...",
      };
    } catch (error) {
      logger.error("Error deploying token:", error);
      throw error;
    }
  }
}
