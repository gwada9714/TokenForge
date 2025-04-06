import { z } from 'zod';
import { FirebaseError } from '../utils/error-handler';
import { logger } from '../core/logger';

const LOG_CATEGORY = 'Config Validator';

// Schémas de validation spécifiques
const ChainListSchema = z.string().transform(str => 
  str.split(',').map(Number).filter(n => !isNaN(n))
);

const UrlSchema = z.string().url().or(z.literal('http://localhost:3000'));

const TimeoutSchema = z.string().transform(Number).refine(
  (n) => n > 0 && n <= 3600,
  { message: "Timeout must be between 1 and 3600 seconds" }
);

// Schéma principal de l'environnement
const EnvironmentSchema = z.object({
  // Configuration de base
  VITE_ENV: z.enum(['development', 'production']),
  VITE_API_URL: UrlSchema,
  VITE_SUPPORTED_CHAINS: ChainListSchema,
  VITE_SW_VERSION: z.string(),

  // Configuration Firebase
  VITE_FIREBASE_API_KEY: z.string(),
  VITE_FIREBASE_AUTH_DOMAIN: z.string(),
  VITE_FIREBASE_PROJECT_ID: z.string(),
  VITE_FIREBASE_STORAGE_BUCKET: z.string(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  VITE_FIREBASE_APP_ID: z.string(),
  VITE_FIREBASE_MEASUREMENT_ID: z.string(),
  VITE_RECAPTCHA_SITE_KEY: z.string().optional(),

  // Configuration Blockchain
  VITE_WALLET_CONNECT_PROJECT_ID: z.string(),
  VITE_ALCHEMY_API_KEY: z.string(),
  VITE_MAINNET_RPC_URL: z.string().url(),
  VITE_SEPOLIA_RPC_URL: z.string().url(),

  // Sécurité & CSP
  VITE_CSP_NONCE_LENGTH: z.string().transform(Number),
  VITE_CSP_REPORT_URI: z.string(),
  VITE_STRICT_CSP: z.string().transform(val => val === 'true'),
  VITE_ALLOW_THIRD_PARTY_COOKIES: z.string().transform(val => val === 'true'),
  VITE_CONTENT_TYPE_OPTIONS: z.string(),
  VITE_XSS_PROTECTION: z.string(),
  VITE_SESSION_TIMEOUT: TimeoutSchema,
  VITE_MAX_LOGIN_ATTEMPTS: z.string().transform(Number),
  VITE_LOCKOUT_DURATION: z.string().transform(Number),
  VITE_REQUIRE_EMAIL_VERIFICATION: z.string().transform(val => val === 'true'),

  // Contrats Sepolia
  VITE_TOKEN_FACTORY_SEPOLIA: z.string(),
  VITE_PLATFORM_TOKEN_SEPOLIA: z.string(),
  VITE_TAX_SYSTEM_SEPOLIA: z.string(),
  VITE_TOKEN_FORGE_PLANS_SEPOLIA: z.string(),

  // Paramètres de build
  VITE_DEFAULT_GAS_LIMIT: z.string().transform(Number),
  VITE_GAS_PRICE_MULTIPLIER: z.string().transform(Number),

  // Paramètres additionnels
  VITE_API_TIMEOUT: z.string().transform(Number),
  VITE_MAX_BATCH_SIZE: z.string().transform(Number),
  VITE_ENABLE_QUERY_CACHE: z.string().transform(val => val === 'true'),
  VITE_CACHE_TIME: z.string().transform(Number),
  VITE_ENABLE_DEBUG_LOGS: z.string().transform(val => val === 'true'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
  VITE_SENTRY_SAMPLE_RATE: z.string().transform(Number),
  VITE_ERROR_REPORTING_ENABLED: z.string().transform(val => val === 'true'),
  VITE_RATE_LIMIT_WINDOW: z.string().transform(Number),
  VITE_RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number)
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export const validateEnvironment = (): Environment => {
  try {
    const env = EnvironmentSchema.parse(import.meta.env);

    // Validations supplémentaires spécifiques au contexte
    if (env.VITE_ENV === 'production') {
      if (!env.VITE_STRICT_CSP) {
        logger.warn(LOG_CATEGORY, {
          message: 'CSP strict non activé en production',
          context: { env: 'production' }
        });
      }
      
      if (!env.VITE_RECAPTCHA_SITE_KEY) {
        logger.warn(LOG_CATEGORY, {
          message: 'reCAPTCHA non configuré en production',
          context: { env: 'production' }
        });
      }
    }

    logger.info(LOG_CATEGORY, {
      message: 'Configuration environnement validée',
      context: {
        env: env.VITE_ENV,
        chains: env.VITE_SUPPORTED_CHAINS,
        debugEnabled: env.VITE_ENABLE_DEBUG_LOGS
      }
    });

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }));

      throw new FirebaseError(
        'ENV_VALIDATION_ERROR',
        'Validation de l\'environnement échouée',
        { issues }
      );
    }

    throw new FirebaseError(
      'ENV_VALIDATION_ERROR',
      'Erreur inattendue lors de la validation',
      { error }
    );
  }
};

export const validateFirebaseConfig = (config: Record<string, unknown>): void => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields = requiredFields.filter(field => !config[field]);

  if (missingFields.length > 0) {
    throw new FirebaseError(
      'CONFIG_VALIDATION_ERROR',
      'Configuration Firebase invalide',
      { missingFields }
    );
  }

  logger.info(LOG_CATEGORY, {
    message: 'Configuration Firebase validée',
    context: {
      projectId: config.projectId,
      hasAnalytics: !!config.measurementId
    }
  });
};
