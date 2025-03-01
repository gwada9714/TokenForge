import { 
  Connection, 
  PublicKey, 
  Transaction as SolanaTransaction, 
  SystemProgram, 
  Keypair, 
  sendAndConfirmTransaction,
  clusterApiUrl,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  getMint,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { IBlockchainService } from '../interfaces/IBlockchainService';
import { IPaymentService } from '../interfaces/IPaymentService';
import { ITokenService } from '../interfaces/ITokenService';
import { TokenConfig, DeploymentResult, TokenInfo, ValidationResult, LiquidityConfig, PaymentStatus } from '../types';
import { createSolanaProvider } from '../providers';

/**
 * Service blockchain spécifique à Solana
 * Implémente l'interface IBlockchainService pour Solana
 * Note: Contrairement aux blockchains EVM, Solana utilise une approche différente
 */
export class SolanaBlockchainService implements IBlockchainService {
  protected connection: Connection;
  protected wallet: any; // Wallet Solana
  protected chainName: string = 'solana';

  constructor(walletProvider?: any) {
    this.connection = createSolanaProvider();
    this.wallet = walletProvider;
  }

  getProvider() {
    return { connection: this.connection, wallet: this.wallet };
  }

  async getBalance(address: string): Promise<bigint> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return BigInt(balance);
    } catch (error) {
      console.error('Error getting Solana balance:', error);
      return 0n;
    }
  }

  async getNetworkId(): Promise<number> {
    // Solana n'a pas de concept de chainId comme les blockchains EVM
    // On retourne un identifiant fixe pour Solana mainnet
    return 101; // 101 pour mainnet, 102 pour testnet, 103 pour devnet
  }

  async isConnected(): Promise<boolean> {
    try {
      // Vérifier la connexion en récupérant la version de l'API
      const version = await this.connection.getVersion();
      return true;
    } catch (error) {
      console.error('Error checking Solana connection:', error);
      return false;
    }
  }

  async estimateGas(transaction: any): Promise<bigint> {
    // Solana utilise un modèle de frais différent basé sur les "compute units"
    try {
      // Si c'est une transaction Solana, on peut l'estimer
      if (transaction instanceof SolanaTransaction) {
        const { value } = await this.connection.simulateTransaction(transaction);
        // Convertir les unités de calcul en lamports (1 SOL = 10^9 lamports)
        const computeUnits = value?.unitsConsumed || 0;
        // Estimation approximative: 1 compute unit = 0.0000005 lamports
        return BigInt(Math.ceil(computeUnits * 0.0000005));
      }
      // Pour les transactions simples, on retourne un coût fixe
      return BigInt(5000); // 5000 lamports (0.000005 SOL)
    } catch (error) {
      console.error('Error estimating Solana gas:', error);
      return BigInt(5000); // Valeur par défaut
    }
  }

  // Méthodes spécifiques à Solana
  async getRecentBlockhash(): Promise<string> {
    try {
      const { blockhash } = await this.connection.getLatestBlockhash();
      return blockhash;
    } catch (error) {
      console.error('Error getting Solana blockhash:', error);
      throw error;
    }
  }

  async getSlot(): Promise<number> {
    try {
      return await this.connection.getSlot();
    } catch (error) {
      console.error('Error getting Solana slot:', error);
      return 0;
    }
  }

  async getMinimumBalanceForRentExemption(size: number): Promise<number> {
    try {
      return await this.connection.getMinimumBalanceForRentExemption(size);
    } catch (error) {
      console.error('Error getting Solana rent exemption:', error);
      // Valeur par défaut pour un petit compte (environ 0.00203928 SOL)
      return 2039280;
    }
  }
  
  // Convertir SOL en lamports
  solToLamports(sol: number): number {
    return sol * LAMPORTS_PER_SOL;
  }
  
  // Convertir lamports en SOL
  lamportsToSol(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }
}

/**
 * Service de paiement spécifique à Solana
 * Implémente l'interface IPaymentService pour Solana
 */
export class SolanaPaymentService implements IPaymentService {
  private blockchainService: SolanaBlockchainService;

  constructor(walletProvider?: any) {
    this.blockchainService = new SolanaBlockchainService(walletProvider);
  }

  async createPaymentSession(amount: bigint, currency: string): Promise<string> {
    // Implémentation pour Solana
    // Génère un identifiant de session et stocke les détails de paiement
    const sessionId = `sol-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    // Logique de création de session...
    return sessionId;
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    // Vérifie le statut du paiement
    return { status: 'pending', details: { sessionId } };
  }

  async verifyPayment(transactionHash: string): Promise<boolean> {
    // Vérifier la transaction sur la blockchain
    try {
      const { connection } = this.blockchainService.getProvider();
      const signature = transactionHash;
      const status = await connection.getSignatureStatus(signature);
      
      // Vérifier que la transaction est confirmée
      return status?.value !== null && 
             status?.value.confirmationStatus === 'confirmed' || 
             status?.value.confirmationStatus === 'finalized';
    } catch (error) {
      console.error('Error verifying Solana payment:', error);
      return false;
    }
  }

  async calculateFees(amount: bigint): Promise<bigint> {
    // Calcul des frais pour Solana
    try {
      // Récupérer les frais récents
      const recentBlockhash = await this.blockchainService.getRecentBlockhash();
      
      // Solana a des frais fixes par signature (environ 5000 lamports)
      // + frais variables selon la complexité (négligeables pour les transactions simples)
      const baseFee = 5000n;
      
      // Pour les transactions plus complexes comme le déploiement de tokens,
      // on ajoute un supplément
      if (amount > 100000000n) { // Si montant > 0.1 SOL, on suppose une transaction complexe
        return baseFee + 10000n; // 15000 lamports au total (0.000015 SOL)
      }
      
      return baseFee;
    } catch (error) {
      console.error('Error calculating Solana fees:', error);
      return 5000n; // Valeur par défaut
    }
  }

  // Méthodes spécifiques à Solana
  async transferSOL(fromKeypair: Keypair, toAddress: string, amount: number): Promise<string> {
    try {
      const { connection } = this.blockchainService.getProvider();
      const toPublicKey = new PublicKey(toAddress);
      
      // Créer une transaction de transfert
      const transaction = new SolanaTransaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: amount,
        })
      );
      
      // Récupérer le blockhash récent
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromKeypair.publicKey;
      
      // Signer et envoyer la transaction
      const signature = await sendAndConfirmTransaction(
        connection, 
        transaction, 
        [fromKeypair]
      );
      
      return signature;
    } catch (error) {
      console.error('Error transferring SOL:', error);
      throw error;
    }
  }
  
  // Créer un compte de token
  async createTokenAccount(owner: Keypair, mint: PublicKey): Promise<PublicKey> {
    try {
      const { connection } = this.blockchainService.getProvider();
      
      // Créer un compte associé pour le token
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        owner,
        mint,
        owner.publicKey
      );
      
      return tokenAccount.address;
    } catch (error) {
      console.error('Error creating token account:', error);
      throw error;
    }
  }
}

/**
 * Service de gestion des tokens spécifique à Solana
 * Implémente l'interface ITokenService pour Solana
 * Note: La création de tokens sur Solana utilise le Token Program
 */
export class SolanaTokenService implements ITokenService {
  private blockchainService: SolanaBlockchainService;

  constructor(walletProvider?: any) {
    this.blockchainService = new SolanaBlockchainService(walletProvider);
  }

  async deployToken(tokenConfig: TokenConfig): Promise<DeploymentResult> {
    try {
      const { connection, wallet } = this.blockchainService.getProvider();
      
      if (!wallet || !wallet.payer) {
        throw new Error('Wallet not available for deployment');
      }
      
      // Utiliser le payer du wallet comme autorité
      const payer = wallet.payer as Keypair;
      
      // Générer une nouvelle paire de clés pour le token
      const mintKeypair = Keypair.generate();
      
      console.log(`Creating token: ${tokenConfig.name} (${tokenConfig.symbol})`);
      
      // Créer le token avec les décimales spécifiées
      const tokenMint = await createMint(
        connection,
        payer,
        payer.publicKey, // Mint authority
        payer.publicKey, // Freeze authority (optional)
        tokenConfig.decimals
      );
      
      console.log(`Token created with address: ${tokenMint.toBase58()}`);
      
      // Créer un compte associé pour le token
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        tokenMint,
        payer.publicKey
      );
      
      console.log(`Token account created: ${tokenAccount.address.toBase58()}`);
      
      // Mint initial supply
      const initialSupply = tokenConfig.initialSupply * (10 ** tokenConfig.decimals);
      await mintTo(
        connection,
        payer,
        tokenMint,
        tokenAccount.address,
        payer, // Mint authority
        initialSupply
      );
      
      console.log(`Minted ${tokenConfig.initialSupply} tokens to ${tokenAccount.address.toBase58()}`);
      
      // Récupérer la signature de la dernière transaction
      const signatures = await connection.getSignaturesForAddress(tokenMint);
      const transactionHash = signatures[0]?.signature || 'unknown_transaction_hash';
      
      return {
        transactionHash,
        tokenAddress: tokenMint.toBase58(),
        chainId: await this.blockchainService.getNetworkId(),
      };
    } catch (error) {
      console.error('Error deploying Solana token:', error);
      throw error;
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      const { connection } = this.blockchainService.getProvider();
      
      // Convertir l'adresse en PublicKey
      const mintPublicKey = new PublicKey(tokenAddress);
      
      // Récupérer les informations du token
      const mintInfo = await getMint(
        connection,
        mintPublicKey
      );
      
      // Note: Solana SPL tokens n'ont pas de nom ou symbole stockés on-chain
      // Ces informations sont généralement stockées off-chain ou dans des métadonnées
      
      return {
        name: 'Unknown', // Pas disponible on-chain
        symbol: 'Unknown', // Pas disponible on-chain
        totalSupply: BigInt(Number(mintInfo.supply)),
        decimals: mintInfo.decimals,
        // Autres informations disponibles
        mintAuthority: mintInfo.mintAuthority?.toBase58(),
        freezeAuthority: mintInfo.freezeAuthority?.toBase58(),
        isInitialized: mintInfo.isInitialized,
      };
    } catch (error) {
      console.error('Error getting Solana token info:', error);
      return {
        name: 'Error',
        symbol: 'Error',
        totalSupply: 0n,
        decimals: 9,
      };
    }
  }

  async estimateDeploymentCost(tokenConfig: TokenConfig): Promise<bigint> {
    try {
      const { connection } = this.blockchainService.getProvider();
      
      // Taille approximative d'un mint account
      const mintAccountSize = 82;
      
      // Coût pour l'exemption de loyer (rent exemption)
      const mintRentExemption = await connection.getMinimumBalanceForRentExemption(mintAccountSize);
      
      // Taille approximative d'un token account
      const tokenAccountSize = 165;
      const tokenAccountRentExemption = await connection.getMinimumBalanceForRentExemption(tokenAccountSize);
      
      // Frais de transaction (environ 10000 lamports pour les 2-3 transactions nécessaires)
      const transactionFees = 10000;
      
      // Coût total
      const totalCost = mintRentExemption + tokenAccountRentExemption + transactionFees;
      
      return BigInt(totalCost);
    } catch (error) {
      console.error('Error estimating Solana deployment cost:', error);
      // Valeur par défaut (environ 0.00303928 SOL)
      return BigInt(3039280);
    }
  }

  validateTokenConfig(tokenConfig: TokenConfig): ValidationResult {
    // Validation de la configuration du token selon les règles Solana
    const errors = [];

    if (!tokenConfig.name || tokenConfig.name.length < 1 || tokenConfig.name.length > 50) {
      errors.push('Token name must be between 1 and 50 characters');
    }

    if (!tokenConfig.symbol || tokenConfig.symbol.length < 1 || tokenConfig.symbol.length > 10) {
      errors.push('Token symbol must be between 1 and 10 characters');
    }

    // Solana utilise généralement 9 décimales par défaut
    if (tokenConfig.decimals !== undefined && (tokenConfig.decimals < 0 || tokenConfig.decimals > 9)) {
      errors.push('Decimals should be between 0 and 9 for Solana tokens');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async setupAutoLiquidity(tokenAddress: string, config: LiquidityConfig): Promise<boolean> {
    try {
      // Note: L'implémentation complète nécessiterait l'intégration avec Raydium ou Orca
      // Ce qui est au-delà de la portée de cette implémentation de base
      
      console.log(`Setting up auto-liquidity for token ${tokenAddress}`);
      console.log(`Pair with: ${config.pairWith}`);
      console.log(`Initial liquidity: ${config.initialLiquidityAmount}`);
      
      // Pour une implémentation réelle, il faudrait:
      // 1. Créer un pool de liquidité sur Raydium ou Orca
      // 2. Ajouter la liquidité initiale
      // 3. Configurer les paramètres de liquidité automatique
      
      // Simulation de succès pour l'instant
      return true;
    } catch (error) {
      console.error('Error setting up Solana auto-liquidity:', error);
      return false;
    }
  }
}
