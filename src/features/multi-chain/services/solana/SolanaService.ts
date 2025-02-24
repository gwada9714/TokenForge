import {
  Connection,
  PublicKey,
  SystemProgram,
  Keypair,
} from '@solana/web3.js';
import {
  createMint,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
} from '@solana/spl-token';
import { ChainId } from '../../types/Chain';
import { IBlockchainService, TokenInfo } from '../interfaces/IBlockchainService';
import { BaseProviderService } from '../BaseProviderService';
import { PROVIDERS } from '../../config/dependencies';
import { Address } from 'viem';

export class SolanaService implements IBlockchainService {
  private connection: Connection | null = null;
  private priceApiUrl: string;

  constructor() {
    this.priceApiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&x_cg_demo_api_key=${PROVIDERS.COINGECKO_KEY}`;
  }

  private async initConnection() {
    if (!this.connection) {
      const provider = await BaseProviderService.getProvider(ChainId.SOLANA);
      if (!(provider instanceof Connection)) {
        throw new Error('Invalid provider type for Solana');
      }
      this.connection = provider;
    }
    return this.connection;
  }

  async getNativeTokenPrice(): Promise<number> {
    try {
      const response = await fetch(this.priceApiUrl);
      const data = await response.json();
      return data.solana.usd;
    } catch (error) {
      console.error('Failed to fetch SOL price:', error);
      return 0;
    }
  }

  async createToken(params: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    owner: Address;
  }): Promise<Address> {
    const connection = await this.initConnection();
    
    try {
      // Créer un nouveau compte pour le mint
      const mintAccount = Keypair.generate();
      const ownerPublicKey = new PublicKey(params.owner.slice(2)); // Remove '0x' prefix
      const payer = Keypair.generate(); // TODO: Utiliser le vrai wallet de l'utilisateur

      // Calculer l'espace nécessaire pour le mint
      const mintRent = await connection.getMinimumBalanceForRentExemption(
        MINT_SIZE
      );

      // Créer la transaction pour initialiser le mint et l'exécuter
      await SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintAccount.publicKey,
        space: MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      });

      // Initialiser le mint
      await createMint(
        connection,
        payer,
        ownerPublicKey,
        ownerPublicKey,
        params.decimals,
        mintAccount
      );

      // Créer un compte associé pour le propriétaire
      const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mintAccount.publicKey,
        ownerPublicKey
      );

      // Mint les tokens au propriétaire
      await mintTo(
        connection,
        payer,
        mintAccount.publicKey,
        associatedTokenAccount.address,
        ownerPublicKey,
        Number(params.totalSupply) * Math.pow(10, params.decimals)
      );

      return `0x${mintAccount.publicKey.toBase58()}` as Address;
    } catch (error: any) {
      throw new Error(`Failed to create token on Solana: ${error.message}`);
    }
  }

  async getTokenInfo(tokenAddress: Address): Promise<TokenInfo> {
    const connection = await this.initConnection();
    
    try {
      const mintPublicKey = new PublicKey(tokenAddress.slice(2));
      const mintInfo = await getMint(connection, mintPublicKey);

      return {
        address: tokenAddress,
        name: '', // Les tokens SPL n'ont pas de nom sur la chaîne
        symbol: '', // Les tokens SPL n'ont pas de symbole sur la chaîne
        decimals: mintInfo.decimals,
        totalSupply: BigInt(mintInfo.supply.toString()),
      };
    } catch (error: any) {
      throw new Error(`Failed to get token info: ${error.message}`);
    }
  }

  async getBalance(address: Address): Promise<bigint> {
    const connection = await this.initConnection();
    try {
      const publicKey = new PublicKey(address.slice(2));
      const balance = await connection.getBalance(publicKey);
      return BigInt(balance);
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async addLiquidity(_params: {
    tokenAddress: Address;
    amount: bigint;
    deadline?: number;
  }): Promise<boolean> {
    throw new Error('Liquidity provision not implemented for Solana yet');
  }

  async removeLiquidity(_params: {
    tokenAddress: Address;
    amount: bigint;
    deadline?: number;
  }): Promise<boolean> {
    throw new Error('Liquidity removal not implemented for Solana yet');
  }

  async stake(_params: {
    tokenAddress: Address;
    amount: bigint;
    duration?: number;
  }): Promise<boolean> {
    throw new Error('Staking not implemented for Solana yet');
  }

  async unstake(_params: {
    tokenAddress: Address;
    amount: bigint;
  }): Promise<boolean> {
    throw new Error('Unstaking not implemented for Solana yet');
  }

  validateAddress(address: string): boolean {
    try {
      if (!address.startsWith('0x')) {
        return false;
      }
      new PublicKey(address.slice(2));
      return true;
    } catch {
      return false;
    }
  }

  async estimateFees(_params: {
    to: Address;
    value?: bigint;
    data?: `0x${string}`;
  }): Promise<bigint> {
    try {
      // Pour Solana, nous estimons simplement les frais de base
      // car il n'y a pas de concept de gas comme dans Ethereum
      return BigInt(5000); // Frais de base en lamports
    } catch (error: any) {
      throw new Error(`Failed to estimate fees: ${error.message}`);
    }
  }
}
