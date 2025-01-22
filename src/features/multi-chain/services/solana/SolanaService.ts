import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createMint,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
} from '@solana/spl_token';
import { ChainId } from '../../types/Chain';
import { IBlockchainService, TokenInfo } from '../interfaces/IBlockchainService';
import { BaseProviderService } from '../BaseProviderService';
import { PROVIDERS } from '../../config/dependencies';
import { BigNumber } from 'ethers';

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
    owner: string;
  }): Promise<string> {
    const connection = await this.initConnection();
    
    try {
      // Créer un nouveau compte pour le mint
      const mintAccount = Keypair.generate();
      const ownerPublicKey = new PublicKey(params.owner);
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

      return mintAccount.publicKey.toString();
    } catch (error: any) {
      throw new Error(`Failed to create token on Solana: ${error.message}`);
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const connection = await this.initConnection();
    
    try {
      const mintPublicKey = new PublicKey(tokenAddress);
      const mintInfo = await getMint(connection, mintPublicKey);

      return {
        address: tokenAddress,
        name: '', // Les tokens SPL n'ont pas de nom sur la chaîne
        symbol: '', // Les tokens SPL n'ont pas de symbole sur la chaîne
        decimals: mintInfo.decimals,
        totalSupply: mintInfo.supply.toString(),
      };
    } catch (error: any) {
      throw new Error(`Failed to get token info: ${error.message}`);
    }
  }

  async getBalance(address: string): Promise<BigNumber> {
    const connection = await this.initConnection();
    try {
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return BigNumber.from(balance.toString());
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async addLiquidity(_params: {
    tokenAddress: string;
    amount: string;
    deadline?: number;
  }): Promise<boolean> {
    await this.initConnection();
    
    // TODO: Implement Solana liquidity provision using:
    // - Raydium DEX integration
    // - Orca DEX integration
    // - Handle pool creation if needed
    // - Manage slippage and deadlines
    throw new Error('Liquidity provision not implemented for Solana yet');
  }

  async removeLiquidity(_params: {
    tokenAddress: string;
    amount: string;
    deadline?: number;
  }): Promise<boolean> {
    // TODO: Implement Solana liquidity removal with:
    // - Support for multiple DEX protocols
    // - Handling of LP token burning
    // - Slippage protection
    // - Emergency withdrawal options
    throw new Error('Liquidity removal not implemented for Solana yet');
  }

  async stake(_params: {
    tokenAddress: string;
    amount: string;
    duration?: number;
  }): Promise<boolean> {
    // TODO: Implement Solana staking with:
    // - Native SOL staking with validators
    // - SPL token staking pools
    // - Integration with Marinade Finance
    // - Liquid staking options
    throw new Error('Staking not implemented for Solana yet');
  }

  async unstake(_params: {
    tokenAddress: string;
    amount: string;
  }): Promise<boolean> {
    // TODO: Implement Solana unstaking with:
    // - Validator unstaking process
    // - Handling of unstaking delays
    // - Liquid staking token unwrapping
    // - Reward collection
    throw new Error('Unstaking not implemented for Solana yet');
  }

  validateAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  async estimateFees(params: {
    to: string;
    value?: string;
    data?: string;
  }): Promise<BigNumber> {
    const connection = await this.initConnection();
    
    try {
      // Estimer les frais pour une transaction standard
      const { feeCalculator } = await connection.getRecentBlockhash();
      const estimatedFee = feeCalculator.lamportsPerSignature;
      
      // Ajouter des frais supplémentaires si des instructions complexes sont présentes
      const complexityFee = params.data ? LAMPORTS_PER_SOL / 100 : 0; // 0.01 SOL pour les transactions complexes
      
      return BigNumber.from((estimatedFee + complexityFee).toString());
    } catch (error: any) {
      throw new Error(`Failed to estimate fees: ${error.message}`);
    }
  }
}
