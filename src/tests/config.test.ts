import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { configService } from "../core/config";

describe("Config Service", () => {
  // Sauvegarder les variables d'environnement originales
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    // Simuler les variables d'environnement
    vi.stubGlobal("import.meta.env", {
      ...import.meta.env,
      VITE_FIREBASE_API_KEY: "test-api-key",
      VITE_FIREBASE_AUTH_DOMAIN: "test-auth-domain",
      VITE_FIREBASE_PROJECT_ID: "test-project-id",
      VITE_FIREBASE_STORAGE_BUCKET: "test-storage-bucket",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "test-messaging-sender-id",
      VITE_FIREBASE_APP_ID: "test-app-id",
      VITE_ENV: "development",
      VITE_WALLET_CONNECT_PROJECT_ID: "test-wallet-connect-project-id",
      VITE_ETHERSCAN_API_KEY: "test-etherscan-api-key",
      VITE_ALCHEMY_API_KEY: "test-alchemy-api-key",
      VITE_SUPPORTED_CHAINS: [1, 11155111],
      VITE_API_TIMEOUT: 30000,
      VITE_ENABLE_DEBUG_LOGS: true,
      VITE_ERROR_REPORTING_ENABLED: true,
      VITE_SENTRY_SAMPLE_RATE: 0.1,
      VITE_RATE_LIMIT_WINDOW: 60000,
      VITE_RATE_LIMIT_MAX_REQUESTS: 100,
      VITE_ENABLE_QUERY_CACHE: true,
      VITE_CACHE_TIME: 300000,
      VITE_MAX_BATCH_SIZE: 100,
      VITE_ENABLE_FAUCET: false,
      VITE_ENABLE_ANALYTICS: false,
    });
  });

  afterEach(() => {
    // Restaurer les variables d'environnement originales
    vi.stubGlobal("import.meta.env", originalEnv);
  });

  it("should be initialized", () => {
    expect(configService.isInitialized()).toBe(true);
  });

  it("should provide Firebase configuration", () => {
    const firebaseConfig = configService.getFirebaseConfig();

    expect(firebaseConfig).toBeDefined();
    expect(firebaseConfig.apiKey).toBe("test-api-key");
    expect(firebaseConfig.authDomain).toBeDefined();
    expect(firebaseConfig.projectId).toBeDefined();
    expect(firebaseConfig.storageBucket).toBeDefined();
    expect(firebaseConfig.messagingSenderId).toBeDefined();
    expect(firebaseConfig.appId).toBeDefined();
  });

  it("should provide environment information", () => {
    expect(configService.isDevelopment()).toBe(true);
    expect(configService.isProduction()).toBe(false);
  });

  it("should provide complete configuration", () => {
    const config = configService.getConfig();

    expect(config).toBeDefined();
    expect(config.firebase).toBeDefined();
    expect(config.web3).toBeDefined();
    expect(config.api).toBeDefined();
    expect(config.security).toBeDefined();
    expect(config.logging).toBeDefined();
    expect(config.cache).toBeDefined();
    expect(config.features).toBeDefined();
  });
});
