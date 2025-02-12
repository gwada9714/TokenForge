declare namespace FirebaseTypes {
  interface LogMessage {
    message: string;
    context?: Record<string, unknown>;
    error?: Error;
    timestamp?: Date;
  }

  interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  }

  interface AppCheckConfig {
    provider: ReCaptchaV3Provider;
    isTokenAutoRefreshEnabled: boolean;
    debugToken?: boolean;
  }

  interface SecurityConfig {
    strictCSP: boolean;
    nonceLength: number;
    reportUri: string;
    allowThirdPartyCookies: boolean;
    contentTypeOptions: string;
    xssProtection: string;
  }

  interface AuthConfig {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireEmailVerification: boolean;
  }

  interface BlockchainConfig {
    supportedChains: number[];
    walletConnectProjectId: string;
    alchemyApiKey: string;
    mainnetRpcUrl: string;
    sepoliaRpcUrl: string;
    defaultGasLimit: number;
    gasPriceMultiplier: number;
  }

  interface ContractAddresses {
    tokenFactory: string;
    platformToken: string;
    taxSystem: string;
    tokenForgePlans: string;
  }

  interface PerformanceConfig {
    apiTimeout: number;
    maxBatchSize: number;
    enableQueryCache: boolean;
    cacheTime: number;
  }

  interface MonitoringConfig {
    enableDebugLogs: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    sentrySampleRate: number;
    errorReportingEnabled: boolean;
    rateLimitWindow: number;
    rateLimitMaxRequests: number;
  }

  interface SessionData {
    createdAt: Date;
    expiresAt: Date;
    userId: string;
    lastActivity: Date;
  }
}

export = FirebaseTypes;
