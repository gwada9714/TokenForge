import { SiweMessage } from "siwe";
import { ethers } from "ethers";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../../config/firebase";
import { logger } from "../../../core/logger";
import * as Sentry from "@sentry/react";

const LOG_CATEGORY = "Web3Auth";

export class Web3AuthService {
  private static instance: Web3AuthService;
  private provider: ethers.providers.Web3Provider | null = null;

  private constructor() {}

  public static getInstance(): Web3AuthService {
    if (!Web3AuthService.instance) {
      Web3AuthService.instance = new Web3AuthService();
    }
    return Web3AuthService.instance;
  }

  public async connectWallet(): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await this.provider.send("eth_requestAccounts", []);

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      // Vérifier que nous sommes sur le bon réseau
      const network = await this.provider.getNetwork();
      const supportedChains = import.meta.env.VITE_SUPPORTED_CHAINS.split(
        ","
      ).map(Number);

      if (!supportedChains.includes(network.chainId)) {
        throw new Error("Unsupported network");
      }

      logger.info(LOG_CATEGORY, "Wallet connected successfully", {
        address: accounts[0],
        chainId: network.chainId,
      });

      return accounts[0];
    } catch (error) {
      logger.error(LOG_CATEGORY, "Error connecting wallet", error);
      Sentry.captureException(error);
      throw error;
    }
  }

  public async signInWithEthereum(address: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error("Provider not initialized");
      }

      const signer = this.provider.getSigner();

      // Création du message SIWE
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to TokenForge",
        uri: window.location.origin,
        version: "1",
        chainId: (await this.provider.getNetwork()).chainId,
        nonce: await this.getNonce(address),
      });

      // Signature du message
      const signature = await signer.signMessage(message.prepareMessage());

      // Vérification côté serveur
      const verifySignature = httpsCallable(functions, "verifyWeb3Signature");
      const result = await verifySignature({
        message: message.prepareMessage(),
        signature,
        address,
      });

      if (!result.data.valid) {
        throw new Error("Invalid signature");
      }

      logger.info(LOG_CATEGORY, "Web3 authentication successful", {
        address,
        chainId: message.chainId,
      });

      return result.data.token;
    } catch (error) {
      logger.error(LOG_CATEGORY, "Error during Web3 authentication", error);
      Sentry.captureException(error);
      throw error;
    }
  }

  private async getNonce(address: string): Promise<string> {
    try {
      const getNonce = httpsCallable(functions, "getWeb3Nonce");
      const result = await getNonce({ address });
      return result.data.nonce;
    } catch (error) {
      logger.error(LOG_CATEGORY, "Error getting nonce", error);
      Sentry.captureException(error);
      throw error;
    }
  }

  public async switchNetwork(chainId: number): Promise<void> {
    try {
      if (!this.provider) {
        throw new Error("Provider not initialized");
      }

      await this.provider.send("wallet_switchEthereumChain", [
        { chainId: `0x${chainId.toString(16)}` },
      ]);

      logger.info(LOG_CATEGORY, "Network switched successfully", { chainId });
    } catch (error) {
      logger.error(LOG_CATEGORY, "Error switching network", error);
      Sentry.captureException(error);
      throw error;
    }
  }
}
