import { logger } from "./firebase-logger";

const LOG_CATEGORY = "TokenEncryption";

export class TokenEncryption {
  private static instance: TokenEncryption;
  private encryptionKey: CryptoKey | null = null;

  private constructor() {}

  public static getInstance(): TokenEncryption {
    if (!TokenEncryption.instance) {
      TokenEncryption.instance = new TokenEncryption();
    }
    return TokenEncryption.instance;
  }

  private async getEncryptionKey(): Promise<CryptoKey> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    try {
      // Génération d'une clé AES-GCM
      this.encryptionKey = await crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );

      return this.encryptionKey;
    } catch (error) {
      logger.error(LOG_CATEGORY, "Error generating encryption key", error);
      throw new Error("Failed to generate encryption key");
    }
  }

  public async encryptToken(
    token: string
  ): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
    try {
      const key = await this.getEncryptionKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedToken = new TextEncoder().encode(token);

      const encryptedData = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        encodedToken
      );

      return { encryptedData, iv };
    } catch (error) {
      logger.error(LOG_CATEGORY, "Error encrypting token", error);
      throw new Error("Failed to encrypt token");
    }
  }

  public async decryptToken(
    encryptedData: ArrayBuffer,
    iv: Uint8Array
  ): Promise<string> {
    try {
      const key = await this.getEncryptionKey();

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        encryptedData
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      logger.error(LOG_CATEGORY, "Error decrypting token", error);
      throw new Error("Failed to decrypt token");
    }
  }

  public async encryptAndStoreToken(token: string): Promise<void> {
    try {
      const { encryptedData, iv } = await this.encryptToken(token);

      // Stockage sécurisé du token chiffré
      const encryptedToken = {
        data: Array.from(new Uint8Array(encryptedData)),
        iv: Array.from(iv),
        timestamp: Date.now(),
      };

      // Stockage en session storage (plus sécurisé que localStorage)
      sessionStorage.setItem("encryptedToken", JSON.stringify(encryptedToken));
    } catch (error) {
      logger.error(LOG_CATEGORY, "Error storing encrypted token", error);
      throw new Error("Failed to store encrypted token");
    }
  }

  public async retrieveAndDecryptToken(): Promise<string | null> {
    try {
      const storedToken = sessionStorage.getItem("encryptedToken");
      if (!storedToken) {
        return null;
      }

      const { data, iv, timestamp } = JSON.parse(storedToken);

      // Vérification de l'expiration (24h)
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem("encryptedToken");
        return null;
      }

      const encryptedData = new Uint8Array(data).buffer;
      const ivArray = new Uint8Array(iv);

      return await this.decryptToken(encryptedData, ivArray);
    } catch (error) {
      logger.error(LOG_CATEGORY, "Error retrieving encrypted token", error);
      return null;
    }
  }

  public clearStoredToken(): void {
    sessionStorage.removeItem("encryptedToken");
  }
}
