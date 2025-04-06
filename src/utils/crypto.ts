import { Buffer } from "buffer";

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

export class CryptoService {
  private static instance: CryptoService;
  private key: CryptoKey | null = null;

  private constructor() {}

  static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }

  async initialize(masterKey?: string): Promise<void> {
    if (!this.key) {
      const keyMaterial = await this.getKeyMaterial(masterKey);
      const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
      this.key = await this.deriveKey(keyMaterial, salt);
    }
  }

  private async getKeyMaterial(masterKey?: string): Promise<CryptoKey> {
    const key = masterKey || process.env.VITE_CRYPTO_KEY || crypto.randomUUID();
    const encoder = new TextEncoder();
    return crypto.subtle.importKey(
      "raw",
      encoder.encode(key),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );
  }

  private async deriveKey(
    keyMaterial: CryptoKey,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async encryptData(data: string): Promise<string> {
    if (!this.key) {
      await this.initialize();
    }

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv,
      },
      this.key!,
      encoder.encode(data)
    );

    const encryptedArray = new Uint8Array(encryptedContent);
    const buffer = Buffer.concat([
      Buffer.from(iv),
      Buffer.from(encryptedArray),
    ]);

    return buffer.toString("base64");
  }

  async decryptData(encryptedData: string): Promise<string> {
    if (!this.key) {
      await this.initialize();
    }

    const decoder = new TextDecoder();
    const buffer = Buffer.from(encryptedData, "base64");

    const iv = buffer.subarray(0, IV_LENGTH);
    const content = buffer.subarray(IV_LENGTH);

    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
      },
      this.key!,
      content
    );

    return decoder.decode(decryptedContent);
  }
}

export const cryptoService = CryptoService.getInstance();
