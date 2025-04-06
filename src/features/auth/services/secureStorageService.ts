import { AES, enc } from "crypto-js";
import { errorService } from "./errorService";
import { AuthErrorCode } from "../errors/AuthError";

const STORAGE_PREFIX = "tokenforge_";
const ENCRYPTION_KEY = process.env.REACT_APP_STORAGE_KEY || "default-dev-key";

interface StorageItem<T = unknown> {
  data: T;
  timestamp: number;
  version: string;
}

class SecureStorageService {
  private static instance: SecureStorageService;
  private storage: Storage;

  private constructor() {
    this.storage = window.sessionStorage;
  }

  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  private getFullKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  private encrypt(data: string): string {
    return AES.encrypt(data, ENCRYPTION_KEY).toString();
  }

  private decrypt(encryptedData: string): string {
    try {
      const bytes = AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return bytes.toString(enc.Utf8);
    } catch (error) {
      throw errorService.createAuthError(
        AuthErrorCode.STORAGE_ERROR,
        "Failed to decrypt data. Storage might be compromised.",
        {
          context: "secureStorageService.decrypt",
          originalError:
            error instanceof Error ? error : new Error(String(error)),
        }
      );
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      const item: StorageItem<T> = {
        data: value,
        timestamp: Date.now(),
        version: "1.0",
      };
      const serialized = JSON.stringify(item);
      const encrypted = this.encrypt(serialized);
      this.storage.setItem(this.getFullKey(key), encrypted);
    } catch (error) {
      throw errorService.createAuthError(
        AuthErrorCode.STORAGE_ERROR,
        "Failed to store data",
        {
          context: "secureStorageService.setItem",
          originalError:
            error instanceof Error ? error : new Error(String(error)),
        }
      );
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const encrypted = this.storage.getItem(this.getFullKey(key));
      if (!encrypted) return null;

      const decrypted = this.decrypt(encrypted);
      const item: StorageItem<T> = JSON.parse(decrypted);

      // Vérifier si les données sont expirées (24h)
      const isExpired = Date.now() - item.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        this.removeItem(key);
        return null;
      }

      return item.data;
    } catch (error) {
      throw errorService.createAuthError(
        AuthErrorCode.STORAGE_ERROR,
        "Failed to retrieve data",
        {
          context: "secureStorageService.getItem",
          originalError:
            error instanceof Error ? error : new Error(String(error)),
        }
      );
    }
  }

  removeItem(key: string): void {
    this.storage.removeItem(this.getFullKey(key));
  }

  clear(): void {
    const keys = Object.keys(this.storage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        this.storage.removeItem(key);
      }
    });
  }

  // Méthode spécifique pour le stockage du token JWT
  setAuthToken(token: string): void {
    this.setItem("auth_token", token);
  }

  getAuthToken(): string | null {
    return this.getItem("auth_token");
  }

  removeAuthToken(): void {
    this.removeItem("auth_token");
  }
}

export const secureStorageService = SecureStorageService.getInstance();
