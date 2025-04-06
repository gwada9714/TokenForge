declare module "@solana/web3.js" {
  export class PublicKey {
    constructor(value: string);
    toString(): string;
    toBase58(): string;
    toBuffer(): Buffer;
    equals(publicKey: PublicKey): boolean;
  }

  export class Keypair {
    static generate(): Keypair;
    static fromSecretKey(secretKey: Uint8Array): Keypair;
    static fromSeed(seed: Uint8Array): Keypair;

    publicKey: PublicKey;
    secretKey: Uint8Array;

    constructor();
  }

  export class Connection {
    constructor(endpoint: string, commitment?: string);

    getLatestBlockhash(
      commitment?: string
    ): Promise<{ blockhash: string; lastValidBlockHeight: number }>;
    sendTransaction(
      transaction: any,
      signers?: any[],
      options?: any
    ): Promise<string>;
    confirmTransaction(
      signature: string,
      commitment?: string
    ): Promise<{ value: { err: any } }>;
    getParsedAccountInfo(
      publicKey: PublicKey,
      commitment?: string
    ): Promise<any>;
  }
}
