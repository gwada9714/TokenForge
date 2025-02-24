import { type Chain } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { CorsOptions } from 'cors';
import { HelmetOptions } from 'helmet';

export const chainPolicies = {
  allowedChains: [mainnet, sepolia] as Chain[],
  defaultChain: mainnet,
  rpcConfig: {
    retryCount: 3,
    timeout: 10000,
    batchSize: 4,
  },
  transactionPolicies: {
    maxGasLimit: 500000n,
    maxPriorityFeePerGas: 3000000000n, // 3 gwei
    minConfirmations: 1,
  }
};

export const securityPolicies = {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    maxAge: 86400
  } as CorsOptions,

  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          process.env.API_URL,
          'https://*.infura.io',
          'https://*.alchemyapi.io'
        ],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' },
    xssFilter: true
  } as HelmetOptions,

  walletConnection: {
    requiredConfirmations: 1,
    autoConnect: false,
    connectorTimeout: 5000,
    signMessageTimeout: 30000,
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
  },

  session: {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict'
    }
  }
};
