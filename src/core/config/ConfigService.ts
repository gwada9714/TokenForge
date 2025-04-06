import { z } from "zod";
import { logger } from "../logger";
import {
  EnvSchema,
  FirebaseEnvSchema,
  Web3EnvSchema,
  ApiEnvSchema,
  SecurityEnvSchema,
  LoggingEnvSchema,
  CacheEnvSchema,
  FeaturesEnvSchema,
  IpfsEnvSchema,
  AppConfig,
  FirebaseConfig,
  Web3Config,
  ApiConfig,
  SecurityConfig,
  LoggingConfig,
  CacheConfig,
  FeaturesConfig,
  IpfsConfig,
} from "./types";

/**
 * Service de configuration centralisé pour l'application
 */
export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;
  private initialized = false;

  private constructor() {
    this.config = this.buildConfig();
    this.initialized = true;
  }

  /**
   * Obtient l'instance singleton du service de configuration
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Construit la configuration à partir des variables d'environnement
   */
  private buildConfig(): AppConfig {
    try {
      // Valider les variables d'environnement
      const validatedEnv = this.validateEnv();

      // Construire la configuration
      const config: AppConfig = {
        firebase: this.buildFirebaseConfig(validatedEnv),
        web3: this.buildWeb3Config(validatedEnv),
        api: this.buildApiConfig(validatedEnv),
        security: this.buildSecurityConfig(validatedEnv),
        logging: this.buildLoggingConfig(validatedEnv),
        cache: this.buildCacheConfig(validatedEnv),
        features: this.buildFeaturesConfig(validatedEnv),
        ipfs: this.buildIpfsConfig(validatedEnv),
      };

      // Journaliser la configuration (sans les secrets)
      logger.info({
        category: "Config",
        message: "Configuration chargée avec succès",
        data: {
          environment: config.features.environment,
          firebase: {
            projectId: config.firebase.projectId,
            useEmulator: config.firebase.useEmulator,
          },
          web3: {
            supportedChains: config.web3.supportedChains,
            defaultNetwork: config.web3.networks.default,
          },
          features: {
            enableFaucet: config.features.enableFaucet,
            enableAnalytics: config.features.enableAnalytics,
          },
        },
      });

      return config;
    } catch (error) {
      logger.error({
        category: "Config",
        message: "Erreur lors de la construction de la configuration",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Valide les variables d'environnement
   */
  private validateEnv() {
    try {
      return EnvSchema.parse(import.meta.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));

        logger.error({
          category: "Config",
          message: "Validation des variables d'environnement échouée",
          data: { issues },
        });
      }
      throw error;
    }
  }

  /**
   * Construit la configuration Firebase
   */
  private buildFirebaseConfig(env: any): FirebaseConfig {
    try {
      const firebaseEnv = FirebaseEnvSchema.parse(env);
      return {
        apiKey: firebaseEnv.VITE_FIREBASE_API_KEY,
        authDomain: firebaseEnv.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: firebaseEnv.VITE_FIREBASE_PROJECT_ID,
        storageBucket: firebaseEnv.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: firebaseEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: firebaseEnv.VITE_FIREBASE_APP_ID,
        measurementId: firebaseEnv.VITE_FIREBASE_MEASUREMENT_ID,
        useEmulator: firebaseEnv.VITE_USE_FIREBASE_EMULATOR === "true",
      };
    } catch (error) {
      logger.error({
        category: "Config",
        message: "Erreur lors de la construction de la configuration Firebase",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Construit la configuration Web3
   */
  private buildWeb3Config(env: any): Web3Config {
    try {
      const web3Env = Web3EnvSchema.parse(env);
      return {
        walletConnect: {
          projectId: web3Env.VITE_WALLET_CONNECT_PROJECT_ID,
        },
        contracts: {
          tokenFactory: {
            mainnet: web3Env.VITE_TOKEN_FACTORY_MAINNET,
            sepolia: web3Env.VITE_TOKEN_FACTORY_SEPOLIA,
            default: web3Env.VITE_TOKEN_FACTORY_ADDRESS,
          },
        },
        providers: {
          etherscan: {
            apiKey: web3Env.VITE_ETHERSCAN_API_KEY,
          },
          alchemy: {
            apiKey: web3Env.VITE_ALCHEMY_API_KEY,
          },
          moonpay: web3Env.VITE_MOONPAY_API_KEY
            ? {
                apiKey: web3Env.VITE_MOONPAY_API_KEY,
              }
            : undefined,
        },
        networks: {
          mainnet: web3Env.VITE_MAINNET_RPC_URL
            ? {
                rpcUrl: web3Env.VITE_MAINNET_RPC_URL,
              }
            : undefined,
          sepolia: web3Env.VITE_SEPOLIA_RPC_URL
            ? {
                rpcUrl: web3Env.VITE_SEPOLIA_RPC_URL,
              }
            : undefined,
          default: web3Env.VITE_DEFAULT_NETWORK || "sepolia",
        },
        supportedChains: web3Env.VITE_SUPPORTED_CHAINS || [1, 11155111], // Mainnet, Sepolia
      };
    } catch (error) {
      logger.error({
        category: "Config",
        message: "Erreur lors de la construction de la configuration Web3",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Construit la configuration API
   */
  private buildApiConfig(env: any): ApiConfig {
    try {
      const apiEnv = ApiEnvSchema.parse(env);
      return {
        url: apiEnv.VITE_API_URL,
        timeout: apiEnv.VITE_API_TIMEOUT || 30000,
        baseUrl: apiEnv.VITE_API_BASE_URL,
      };
    } catch (error) {
      logger.error({
        category: "Config",
        message: "Erreur lors de la construction de la configuration API",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Construit la configuration de sécurité
   */
  private buildSecurityConfig(env: any): SecurityConfig {
    try {
      const securityEnv = SecurityEnvSchema.parse(env);
      return {
        recaptcha: securityEnv.VITE_RECAPTCHA_SITE_KEY
          ? {
              siteKey: securityEnv.VITE_RECAPTCHA_SITE_KEY,
            }
          : undefined,
        csp: {
          nonceLength: securityEnv.VITE_CSP_NONCE_LENGTH || 32,
          strict: securityEnv.VITE_STRICT_CSP || false,
          reportUri: securityEnv.VITE_CSP_REPORT_URI,
        },
        session: {
          timeout: securityEnv.VITE_SESSION_TIMEOUT || 3600,
        },
      };
    } catch (error) {
      logger.error({
        category: "Config",
        message:
          "Erreur lors de la construction de la configuration de sécurité",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Construit la configuration de logging
   */
  private buildLoggingConfig(env: any): LoggingConfig {
    try {
      const loggingEnv = LoggingEnvSchema.parse(env);
      return {
        enableDebugLogs: loggingEnv.VITE_ENABLE_DEBUG_LOGS || false,
        logLevel: loggingEnv.VITE_LOG_LEVEL || "info",
        errorReporting: {
          enabled: loggingEnv.VITE_ERROR_REPORTING_ENABLED || false,
          sampleRate: loggingEnv.VITE_SENTRY_SAMPLE_RATE || 0.1,
        },
        rateLimit: {
          window: loggingEnv.VITE_RATE_LIMIT_WINDOW || 60000,
          maxRequests: loggingEnv.VITE_RATE_LIMIT_MAX_REQUESTS || 100,
        },
      };
    } catch (error) {
      logger.error({
        category: "Config",
        message:
          "Erreur lors de la construction de la configuration de logging",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Construit la configuration de cache
   */
  private buildCacheConfig(env: any): CacheConfig {
    try {
      const cacheEnv = CacheEnvSchema.parse(env);
      return {
        enableQueryCache: cacheEnv.VITE_ENABLE_QUERY_CACHE || true,
        cacheTime: cacheEnv.VITE_CACHE_TIME || 300000,
        maxBatchSize: cacheEnv.VITE_MAX_BATCH_SIZE || 100,
      };
    } catch (error) {
      logger.error({
        category: "Config",
        message: "Erreur lors de la construction de la configuration de cache",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Construit la configuration de features
   */
  private buildFeaturesConfig(env: any): FeaturesConfig {
    try {
      const featuresEnv = FeaturesEnvSchema.parse(env);
      return {
        enableFaucet: featuresEnv.VITE_ENABLE_FAUCET || false,
        enableAnalytics: featuresEnv.VITE_ENABLE_ANALYTICS || false,
        swVersion: featuresEnv.VITE_SW_VERSION,
        environment: featuresEnv.VITE_ENV || "development",
      };
    } catch (error) {
      logger.error({
        category: "Config",
        message:
          "Erreur lors de la construction de la configuration de features",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Construit la configuration IPFS
   */
  private buildIpfsConfig(env: any): IpfsConfig {
    try {
      const ipfsEnv = IpfsEnvSchema.parse(env);
      return {
        gateway: ipfsEnv.VITE_IPFS_GATEWAY,
      };
    } catch (error) {
      logger.error({
        category: "Config",
        message: "Erreur lors de la construction de la configuration IPFS",
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  }

  /**
   * Vérifie si le service est initialisé
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Obtient la configuration complète
   */
  public getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Obtient la configuration Firebase
   */
  public getFirebaseConfig(): FirebaseConfig {
    return this.config.firebase;
  }

  /**
   * Obtient la configuration Web3
   */
  public getWeb3Config(): Web3Config {
    return this.config.web3;
  }

  /**
   * Obtient la configuration API
   */
  public getApiConfig(): ApiConfig {
    return this.config.api;
  }

  /**
   * Obtient la configuration de sécurité
   */
  public getSecurityConfig(): SecurityConfig {
    return this.config.security;
  }

  /**
   * Obtient la configuration de logging
   */
  public getLoggingConfig(): LoggingConfig {
    return this.config.logging;
  }

  /**
   * Obtient la configuration de cache
   */
  public getCacheConfig(): CacheConfig {
    return this.config.cache;
  }

  /**
   * Obtient la configuration de features
   */
  public getFeaturesConfig(): FeaturesConfig {
    return this.config.features;
  }

  /**
   * Obtient la configuration IPFS
   */
  public getIpfsConfig(): IpfsConfig {
    return this.config.ipfs;
  }

  /**
   * Vérifie si l'application est en mode développement
   */
  public isDevelopment(): boolean {
    return this.config.features.environment === "development";
  }

  /**
   * Vérifie si l'application est en mode production
   */
  public isProduction(): boolean {
    return this.config.features.environment === "production";
  }
}
