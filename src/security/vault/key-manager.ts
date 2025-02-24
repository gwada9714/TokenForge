import vault from 'node-vault';

interface VaultConfig {
  address: string;
  token: string;
  mount: string;
  keyPath: string;
}

export class KeyManager {
  private client: vault.client;
  private config: VaultConfig;
  private currentKey: string | null = null;
  private keyExpiry: Date | null = null;

  constructor(config: VaultConfig) {
    this.config = config;
    this.client = vault({
      apiVersion: 'v1',
      endpoint: config.address,
      token: config.token,
    });
  }

  async initialize() {
    try {
      // Vérification de la connexion à Vault
      await this.client.health();
      
      // Configuration initiale du moteur de secrets
      await this.setupSecretsEngine();
      
      // Récupération de la clé initiale
      await this.rotateKey();
    } catch (error) {
      console.error('Error initializing Vault key manager:', error);
      throw error;
    }
  }

  private async setupSecretsEngine() {
    try {
      await this.client.mounts();
    } catch {
      await this.client.mount({
        mount_point: this.config.mount,
        type: 'kv',
        options: { version: '2' }
      });
    }
  }

  async getCurrentKey(): Promise<string> {
    if (!this.currentKey || this.shouldRotate()) {
      await this.rotateKey();
    }
    return this.currentKey!;
  }

  private shouldRotate(): boolean {
    if (!this.keyExpiry) return true;
    
    // Rotation si moins de 1 heure avant l'expiration
    const oneHour = 60 * 60 * 1000;
    return Date.now() + oneHour >= this.keyExpiry.getTime();
  }

  async rotateKey(): Promise<void> {
    try {
      // Génération d'une nouvelle clé
      const newKey = this.generateKey();
      const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

      // Stockage dans Vault
      await this.client.write(
        `${this.config.mount}/data/${this.config.keyPath}`,
        {
          data: {
            key: newKey,
            expiry: expiryTime.toISOString(),
          },
        }
      );

      this.currentKey = newKey;
      this.keyExpiry = expiryTime;

      console.debug('Key rotated successfully');
    } catch (error) {
      console.error('Error rotating key:', error);
      throw error;
    }
  }

  private generateKey(): string {
    // Génération d'une clé aléatoire de 32 octets en base64
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }
}

// Instance singleton pour la gestion des clés
export const keyManager = new KeyManager({
  address: process.env.VITE_VAULT_ADDR || 'http://localhost:8200',
  token: process.env.VITE_VAULT_TOKEN || '',
  mount: 'tokenforge',
  keyPath: 'csp-keys',
});
