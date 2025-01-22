import { providers, utils, BigNumber } from 'ethers';
import { 
  Transaction as SolanaTransaction, 
  Connection,
  Commitment
} from '@solana/web3.js';
import { ChainId } from '../types/Chain';
import { BaseProviderService } from './BaseProviderService';
import { DEFAULT_GAS_CONFIG } from '../config/dependencies';

export interface TransactionConfig {
  chainId: ChainId;
  to?: string;
  data?: string;
  value?: string;
  gasLimit?: string;
  gasPriceMultiplier?: number;
}

export interface TransactionResult {
  hash: string;
  confirmation?: number;
  receipt?: any;
  error?: string;
}

type ChainConfigKey = 'ETH' | 'BSC' | 'POLYGON';

export class TransactionService {
  static async sendTransaction(
    config: TransactionConfig,
    signedTx: string | SolanaTransaction
  ): Promise<TransactionResult> {
    try {
      const provider = await BaseProviderService.getProvider(config.chainId);

      if (config.chainId === ChainId.SOLANA) {
        return this.sendSolanaTransaction(
          signedTx as SolanaTransaction,
          provider as Connection
        );
      }

      return this.sendEVMTransaction(
        signedTx as string,
        provider as providers.Provider
      );
    } catch (error: any) {
      return {
        hash: '',
        error: error.message || 'Transaction failed'
      };
    }
  }

  private static async sendEVMTransaction(
    signedTx: string,
    provider: providers.Provider
  ): Promise<TransactionResult> {
    try {
      // Envoyer la transaction
      const tx = await provider.sendTransaction(signedTx);
      
      // Attendre la confirmation
      const receipt = await tx.wait(1);

      return {
        hash: tx.hash,
        confirmation: receipt.confirmations,
        receipt
      };
    } catch (error: any) {
      throw new Error(`EVM Transaction failed: ${error.message}`);
    }
  }

  private static async sendSolanaTransaction(
    signedTx: SolanaTransaction,
    connection: Connection
  ): Promise<TransactionResult> {
    try {
      // Envoyer la transaction
      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      );

      // Attendre la confirmation avec un commitment "confirmed"
      const status = await connection.confirmTransaction(
        signature,
        'confirmed' as Commitment
      );

      if (status.value.err) {
        throw new Error(`Transaction failed: ${status.value.err.toString()}`);
      }

      // Obtenir les détails de la transaction
      const transactionDetails = await connection.getTransaction(signature, {
        commitment: 'confirmed'
      });

      return {
        hash: signature,
        confirmation: transactionDetails?.slot || 0,
        receipt: {
          signature,
          slot: transactionDetails?.slot,
          status: status.value,
          details: transactionDetails
        }
      };
    } catch (error: any) {
      throw new Error(`Solana Transaction failed: ${error.message}`);
    }
  }

  static async estimateGas(
    config: TransactionConfig
  ): Promise<string> {
    if (config.chainId === ChainId.SOLANA) {
      return '0'; // Solana utilise un système différent
    }

    try {
      const provider = await BaseProviderService.getProvider(config.chainId) as providers.Provider;
      
      const gasLimit = await provider.estimateGas({
        to: config.to,
        data: config.data,
        value: config.value ? utils.parseEther(config.value) : undefined
      });

      // Ajouter une marge de sécurité selon la chaîne
      const chainKey = this.getChainKey(config.chainId);
      const chainConfig = DEFAULT_GAS_CONFIG[chainKey];
      const multiplier = config.gasPriceMultiplier || chainConfig.PRICE_MULTIPLIER;
      
      return gasLimit
        .mul(BigNumber.from(Math.floor(multiplier * 100)))
        .div(BigNumber.from(100))
        .toString();
    } catch (error: any) {
      throw new Error(`Gas estimation failed: ${error.message}`);
    }
  }

  private static getChainKey(chainId: ChainId): ChainConfigKey {
    switch (chainId) {
      case ChainId.ETH:
        return 'ETH';
      case ChainId.BSC:
        return 'BSC';
      case ChainId.POLYGON:
        return 'POLYGON';
      default:
        throw new Error(`Unsupported chain ID for gas estimation: ${chainId}`);
    }
  }
}
