/**
 * Déclarations de types pour étendre les types de @solana/web3.js
 * Ces déclarations résolvent les problèmes de typage dans l'adaptateur Solana
 */

// Étendre les types de @solana/web3.js
declare module "@solana/web3.js" {
  // Ajouter les méthodes manquantes à Connection
  interface Connection {
    getBalance(publicKey: PublicKey): Promise<number>;
    getVersion(): Promise<any>;
    simulateTransaction(transaction: Transaction): Promise<{ value: any }>;
    getSlot(): Promise<number>;
    getMinimumBalanceForRentExemption(size: number): Promise<number>;
    getSignatureStatus(signature: string): Promise<{ value: any }>;
    getSignaturesForAddress(
      address: PublicKey
    ): Promise<Array<{ signature: string }>>;
  }

  // Exporter les classes et constantes manquantes
  export class Transaction {
    add(instruction: any): Transaction;
    recentBlockhash: string;
    feePayer: PublicKey;
  }

  export class SystemProgram {
    static transfer(params: {
      fromPubkey: PublicKey;
      toPubkey: PublicKey;
      lamports: number;
    }): any;
  }

  export function sendAndConfirmTransaction(
    connection: Connection,
    transaction: Transaction,
    signers: Array<any>
  ): Promise<string>;

  export function clusterApiUrl(cluster: string): string;

  export const LAMPORTS_PER_SOL: number;
}

// Étendre les types de TokenInfo pour inclure les propriétés spécifiques à Solana
interface TokenInfo {
  mintAuthority?: string;
  freezeAuthority?: string;
  isInitialized?: boolean;
}

// Étendre les types pour @solana/spl-token
declare module "@solana/spl-token" {
  export function createMint(
    connection: any,
    payer: any,
    mintAuthority: any,
    freezeAuthority: any,
    decimals: number
  ): Promise<any>;

  export function getOrCreateAssociatedTokenAccount(
    connection: any,
    payer: any,
    mint: any,
    owner: any
  ): Promise<{ address: any }>;

  export function mintTo(
    connection: any,
    payer: any,
    mint: any,
    destination: any,
    authority: any,
    amount: number
  ): Promise<any>;

  export function transfer(
    connection: any,
    payer: any,
    source: any,
    destination: any,
    owner: any,
    amount: number
  ): Promise<any>;

  export function getMint(
    connection: any,
    mint: any
  ): Promise<{
    supply: any;
    decimals: number;
    isInitialized: boolean;
    mintAuthority: any;
    freezeAuthority: any;
  }>;

  export const TOKEN_PROGRAM_ID: any;
}
