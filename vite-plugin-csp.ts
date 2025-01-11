import type { Plugin } from 'vite';
import { createHash } from 'crypto';

interface CSPPluginOptions {
  development?: boolean;
}

export function cspPlugin(options: CSPPluginOptions = {}): Plugin {
  const isDev = options.development ?? process.env.NODE_ENV === 'development';
  const nonces = new Set<string>();

  return {
    name: 'vite-plugin-csp',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const nonce = createHash('sha256').update(Date.now().toString()).digest('base64');
        nonces.add(nonce);
        
        // Set CSP header
        res.setHeader(
          'Content-Security-Policy',
          generateCSPHeader(nonce, isDev)
        );
        next();
      });
    },
    transformIndexHtml(html) {
      const nonce = createHash('sha256').update(Date.now().toString()).digest('base64');
      nonces.add(nonce);

      // Add nonce to all inline scripts
      html = html.replace(/<script/g, `<script nonce="\${nonce}"`);

      // Add CSP meta tag
      const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${generateCSPHeader(nonce, isDev)}">`;
      html = html.replace('</head>', `${cspMeta}\n</head>`);

      return html;
    },
  };
}

function generateCSPHeader(nonce: string, isDev: boolean): string {
  const policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'strict-dynamic'",
      `'nonce-${nonce}'`,
      // Only add unsafe-eval in development
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': [
      "'self'",
      'https://*.infura.io',
      'https://*.alchemyapi.io',
      'https://api.etherscan.io',
      'wss://*.infura.io',
      'wss://*.alchemyapi.io',
      'https://*.walletconnect.org',
      'https://api.coingecko.com',
      'https://eth-sepolia.g.alchemy.com',
      'https://mainnet.infura.io',
      ...(isDev ? ['ws://localhost:*'] : []),
    ],
    'frame-src': ["'self'", 'https://*.moonpay.com', 'https://*.walletconnect.org'],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'upgrade-insecure-requests': [],
  };

  return Object.entries(policies)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}
