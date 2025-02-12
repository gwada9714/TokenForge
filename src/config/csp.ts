// Content Security Policy Configuration
const generateNonce = () => {
  const length = parseInt(import.meta.env.VITE_CSP_NONCE_LENGTH || '32');
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

interface CspConfig {
  directives: Record<string, string[]>;
  nonce: string;
}

// Liste des domaines autorisés
const ALLOWED_DOMAINS = {
  firebase: [
    'https://*.firebaseapp.com',
    'https://*.googleapis.com',
    'https://*.firebaseio.com'
  ],
  web3: [
    'https://*.walletconnect.com',
    'https://*.infura.io',
    'https://*.alchemy.com'
  ],
  cdn: [
    'https://cdn.jsdelivr.net',
    'https://unpkg.com'
  ]
};

// Liste des hôtes RPC autorisés
const getRpcHosts = () => {
  const mainnetRpc = new URL(import.meta.env.VITE_MAINNET_RPC_URL).origin;
  const sepoliaRpc = new URL(import.meta.env.VITE_SEPOLIA_RPC_URL).origin;
  return [mainnetRpc, sepoliaRpc];
};

export const getCspDirectives = (): CspConfig => {
  const nonce = generateNonce();
  const isDev = import.meta.env.VITE_ENV === 'development';
  const apiUrl = new URL(import.meta.env.VITE_API_URL).origin;
  
  // Base CSP directives avec strict-dynamic
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'strict-dynamic'",
      `'nonce-${nonce}'`,
      // Fallback pour les navigateurs plus anciens
      ...(isDev ? ["'unsafe-eval'"] : [])
    ],
    'style-src': [
      "'self'",
      ...ALLOWED_DOMAINS.cdn,
      // Hashes pour les styles critiques
      "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
      "'sha256-pSTVzZsFAqZY/6LvZBEdxg0hYQvq17kfyqBjy7JqXP4='"
    ],
    'connect-src': [
      "'self'",
      apiUrl,
      ...getRpcHosts(),
      ...ALLOWED_DOMAINS.firebase,
      ...ALLOWED_DOMAINS.web3
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      ...ALLOWED_DOMAINS.cdn
    ],
    'font-src': [
      "'self'",
      'https:',
      'data:',
      ...ALLOWED_DOMAINS.cdn
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'frame-src': [
      "'self'",
      ...ALLOWED_DOMAINS.firebase,
      ...ALLOWED_DOMAINS.web3
    ],
    'manifest-src': ["'self'"],
    'media-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'report-uri': [import.meta.env.VITE_CSP_REPORT_URI || '/api/csp-report'],
    'report-to': ['csp-endpoint']
  };

  // Directives de production uniquement
  if (!isDev) {
    directives['upgrade-insecure-requests'] = [];
    directives['block-all-mixed-content'] = [];
    
    if (import.meta.env.VITE_STRICT_CSP === 'true') {
      directives['require-trusted-types-for'] = ["'script'"];
      directives['trusted-types'] = ['default', 'dompurify'];
    }
  }

  return {
    directives,
    nonce
  };
};

export const getSecurityHeaders = () => {
  const cspConfig = getCspDirectives();
  const cspString = Object.entries(cspConfig.directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

  return {
    'Content-Security-Policy': cspString,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'autoplay=()',
      'document-domain=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'gyroscope=()',
      'picture-in-picture=()',
      'sync-xhr=(self)'
    ].join(', '),
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Report-To': JSON.stringify({
      'group': 'csp-endpoint',
      'max_age': 10886400,
      'endpoints': [{
        'url': import.meta.env.VITE_CSP_REPORT_URI || '/api/csp-report'
      }]
    })
  };
};
